package com.edtech.web.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.edtech.model.entity.StudentExerciseLog;
import com.edtech.model.mapper.StudentExerciseLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class ReportController {

    private final StudentExerciseLogMapper logMapper;

    @GetMapping("/student/{studentId}")
    public List<StudentExerciseLog> getStudentReport(@PathVariable Long studentId) {
        List<StudentExerciseLog> logs = logMapper.selectList(new LambdaQueryWrapper<StudentExerciseLog>()
                .eq(StudentExerciseLog::getStudentId, studentId)
                .orderByDesc(StudentExerciseLog::getSubmitTime));
        
        if (logs.isEmpty()) {
            return new ArrayList<>();
        }
        return logs;
    }

    @GetMapping("/trend/{studentId}")
    public List<Map<String, Object>> getMasteryTrend(@PathVariable Long studentId,
                                                     @RequestParam(defaultValue = "30") int days) {
        LocalDateTime from = LocalDate.now().minusDays(days - 1L).atStartOfDay();
        List<StudentExerciseLog> logs = logMapper.selectList(new LambdaQueryWrapper<StudentExerciseLog>()
                .eq(StudentExerciseLog::getStudentId, studentId)
                .ge(StudentExerciseLog::getSubmitTime, from)
                .orderByAsc(StudentExerciseLog::getSubmitTime));

        if (logs.isEmpty()) {
            return new ArrayList<>();
        }

        Map<LocalDate, int[]> daily = new HashMap<>();
        for (StudentExerciseLog log : logs) {
            LocalDate d = log.getSubmitTime().toLocalDate();
            int[] cnt = daily.computeIfAbsent(d, k -> new int[2]);
            cnt[0]++;
            if (log.getResult() != null && log.getResult() == 1) {
                cnt[1]++;
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        daily.entrySet().stream()
                .sorted(java.util.Map.Entry.comparingByKey())
                .forEach(e -> {
                    int total = e.getValue()[0];
                    int correct = e.getValue()[1];
                    double accuracy = total == 0 ? 0.0 : (double) correct / total;
                    Map<String, Object> item = new HashMap<>();
                    item.put("date", e.getKey().toString());
                    item.put("accuracy", accuracy);
                    item.put("total", total);
                    result.add(item);
                });

        return result;
    }
}
