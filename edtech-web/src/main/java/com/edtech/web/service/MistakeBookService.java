package com.edtech.web.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.edtech.model.entity.MistakeBook;
import com.edtech.model.mapper.MistakeBookMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class MistakeBookService {

    private final MistakeBookMapper mistakeBookMapper;

    @Transactional(rollbackFor = Exception.class)
    public void addMistake(Long studentId, Long questionId) {
        MistakeBook mistake = mistakeBookMapper.selectOne(new LambdaQueryWrapper<MistakeBook>()
                .eq(MistakeBook::getStudentId, studentId)
                .eq(MistakeBook::getQuestionId, questionId));

        if (mistake == null) {
            mistake = new MistakeBook();
            mistake.setStudentId(studentId);
            mistake.setQuestionId(questionId);
            mistake.setErrorCount(1);
            mistake.setIsResolved(0);
            mistake.setLastErrorTime(LocalDateTime.now());
            mistakeBookMapper.insert(mistake);
            log.info("Added new mistake to book. Student: {}, Question: {}", studentId, questionId);
        } else {
            mistake.setErrorCount(mistake.getErrorCount() + 1);
            mistake.setLastErrorTime(LocalDateTime.now());
            mistake.setIsResolved(0); // Re-open if it was resolved
            mistakeBookMapper.updateById(mistake);
            log.info("Updated mistake count. Student: {}, Question: {}, Count: {}", studentId, questionId, mistake.getErrorCount());
        }
    }
}
