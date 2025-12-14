package com.edtech.web.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.edtech.model.entity.StudentExerciseLog;
import com.edtech.model.mapper.StudentExerciseLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

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
}
