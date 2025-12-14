package com.edtech.web.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.edtech.model.entity.KnowledgePoint;
import com.edtech.model.mapper.KnowledgePointMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/knowledge")
@RequiredArgsConstructor
public class KnowledgeController {

    private final KnowledgePointMapper knowledgePointMapper;

    @GetMapping("/graph")
    public Map<String, List<KnowledgePoint>> getKnowledgeGraph() {
        // Group by Subject
        List<KnowledgePoint> allPoints = knowledgePointMapper.selectList(null);
        return allPoints.stream()
                .collect(Collectors.groupingBy(kp -> kp.getSubject() == null ? "Uncategorized" : kp.getSubject()));
    }
    
    @GetMapping("/list")
    public List<KnowledgePoint> getAllKnowledgePoints() {
        return knowledgePointMapper.selectList(null);
    }
}
