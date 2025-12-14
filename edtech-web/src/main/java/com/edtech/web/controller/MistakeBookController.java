package com.edtech.web.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.edtech.model.entity.KnowledgePoint;
import com.edtech.model.entity.MistakeBook;
import com.edtech.model.entity.Question;
import com.edtech.model.mapper.KnowledgePointMapper;
import com.edtech.model.mapper.MistakeBookMapper;
import com.edtech.model.mapper.QuestionMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mistakes")
@Slf4j
@RequiredArgsConstructor
public class MistakeBookController {

    private final MistakeBookMapper mistakeBookMapper;
    private final QuestionMapper questionMapper;
    private final KnowledgePointMapper knowledgePointMapper;

    /**
     * 获取错题列表(带分页)
     */
    @GetMapping("/list/{studentId}")
    public Map<String, Object> getMistakeList(
            @PathVariable Long studentId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long knowledgePointId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "lastErrorTime") String sortBy) {

        // Build query
        LambdaQueryWrapper<MistakeBook> wrapper = new LambdaQueryWrapper<MistakeBook>()
                .eq(MistakeBook::getStudentId, studentId)
                .eq(MistakeBook::getIsResolved, 0); // Only unresolved
        
        // Sort
        if ("errorCount".equals(sortBy)) {
            wrapper.orderByDesc(MistakeBook::getErrorCount);
        } else {
            wrapper.orderByDesc(MistakeBook::getLastErrorTime);
        }

        // Paginate
        Page<MistakeBook> pageResult = mistakeBookMapper.selectPage(new Page<>(page, size), wrapper);
        List<MistakeBook> mistakes = pageResult.getRecords();

        if (mistakes.isEmpty()) {
            Map<String, Object> result = new HashMap<>();
            result.put("list", new ArrayList<>());
            result.put("total", 0);
            result.put("page", page);
            result.put("size", size);
            return result;
        }

        // Get question details
        List<Long> questionIds = mistakes.stream().map(MistakeBook::getQuestionId).collect(Collectors.toList());
        List<Question> questions = questionMapper.selectBatchIds(questionIds);
        Map<Long, Question> questionMap = questions.stream().collect(Collectors.toMap(Question::getId, q -> q));

        // Get knowledge points
        Set<Long> kpIds = questions.stream().map(Question::getKnowledgePointId).collect(Collectors.toSet());
        Map<Long, String> kpNameMap = new HashMap<>();
        if (!kpIds.isEmpty()) {
            List<KnowledgePoint> kps = knowledgePointMapper.selectBatchIds(kpIds);
            kpNameMap = kps.stream().collect(Collectors.toMap(KnowledgePoint::getId, KnowledgePoint::getName));
        }

        // Filter by knowledge point if specified
        final Map<Long, String> finalKpNameMap = kpNameMap;
        
        // Build response list
        List<Map<String, Object>> list = new ArrayList<>();
        for (MistakeBook mistake : mistakes) {
            Question q = questionMap.get(mistake.getQuestionId());
            if (q == null) continue;
            
            // Filter by knowledgePointId if specified
            if (knowledgePointId != null && !knowledgePointId.equals(q.getKnowledgePointId())) {
                continue;
            }
            
            // Filter by keyword if specified
            if (keyword != null && !keyword.isEmpty()) {
                if (q.getContent() != null && !q.getContent().contains(keyword)) {
                    continue;
                }
            }

            Map<String, Object> item = new HashMap<>();
            item.put("id", mistake.getId());
            item.put("questionId", mistake.getQuestionId());
            item.put("errorCount", mistake.getErrorCount());
            item.put("lastErrorTime", mistake.getLastErrorTime());
            item.put("isResolved", mistake.getIsResolved());
            item.put("content", q.getContent());
            item.put("difficulty", q.getDifficulty());
            item.put("knowledgePointId", q.getKnowledgePointId());
            item.put("knowledgePointName", finalKpNameMap.getOrDefault(q.getKnowledgePointId(), "未知"));
            item.put("options", q.getOptions());
            item.put("correctAnswer", q.getCorrectAnswer());
            list.add(item);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("total", pageResult.getTotal());
        result.put("page", page);
        result.put("size", size);
        return result;
    }

    /**
     * 获取错题统计(饼图数据)
     */
    @GetMapping("/stats/{studentId}")
    public Map<String, Object> getMistakeStats(@PathVariable Long studentId) {
        // Get all mistakes for student
        List<MistakeBook> allMistakes = mistakeBookMapper.selectList(
                new LambdaQueryWrapper<MistakeBook>()
                        .eq(MistakeBook::getStudentId, studentId));
        
        if (allMistakes.isEmpty()) {
            Map<String, Object> result = new HashMap<>();
            result.put("totalMistakes", 0);
            result.put("resolvedCount", 0);
            result.put("unresolvedCount", 0);
            result.put("byKnowledgePoint", new ArrayList<>());
            return result;
        }

        // Get question IDs
        List<Long> questionIds = allMistakes.stream().map(MistakeBook::getQuestionId).collect(Collectors.toList());
        List<Question> questions = questionMapper.selectBatchIds(questionIds);
        Map<Long, Long> questionKpMap = questions.stream()
                .collect(Collectors.toMap(Question::getId, Question::getKnowledgePointId));

        // Get knowledge points
        Set<Long> kpIds = new HashSet<>(questionKpMap.values());
        Map<Long, String> kpNameMap = new HashMap<>();
        if (!kpIds.isEmpty()) {
            List<KnowledgePoint> kps = knowledgePointMapper.selectBatchIds(kpIds);
            kpNameMap = kps.stream().collect(Collectors.toMap(KnowledgePoint::getId, KnowledgePoint::getName));
        }

        // Group by knowledge point
        Map<Long, Integer> kpErrorCount = new HashMap<>();
        int resolved = 0;
        int unresolved = 0;
        
        for (MistakeBook m : allMistakes) {
            if (m.getIsResolved() == 1) {
                resolved++;
            } else {
                unresolved++;
            }
            Long kpId = questionKpMap.get(m.getQuestionId());
            if (kpId != null) {
                kpErrorCount.merge(kpId, m.getErrorCount(), Integer::sum);
            }
        }

        // Build pie chart data
        final Map<Long, String> finalKpNameMap = kpNameMap;
        List<Map<String, Object>> pieData = kpErrorCount.entrySet().stream()
                .sorted((a, b) -> b.getValue() - a.getValue())
                .limit(5)
                .map(e -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", finalKpNameMap.getOrDefault(e.getKey(), "未知"));
                    item.put("value", e.getValue());
                    item.put("knowledgePointId", e.getKey());
                    return item;
                }).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("totalMistakes", allMistakes.size());
        result.put("resolvedCount", resolved);
        result.put("unresolvedCount", unresolved);
        result.put("byKnowledgePoint", pieData);
        return result;
    }

    /**
     * 标记错题为已掌握
     */
    @PostMapping("/resolve/{mistakeId}")
    public Map<String, Object> resolveMistake(@PathVariable Long mistakeId) {
        MistakeBook mistake = mistakeBookMapper.selectById(mistakeId);
        Map<String, Object> result = new HashMap<>();
        if (mistake != null) {
            mistake.setIsResolved(1);
            mistakeBookMapper.updateById(mistake);
            result.put("success", true);
            result.put("message", "已标记为掌握");
        } else {
            result.put("success", false);
            result.put("message", "错题记录不存在");
        }
        return result;
    }
}
