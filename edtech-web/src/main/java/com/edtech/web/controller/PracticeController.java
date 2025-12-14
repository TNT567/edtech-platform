package com.edtech.web.controller;

import com.edtech.kt.service.KnowledgeTracingService;
import com.edtech.model.entity.Question;
import com.edtech.model.entity.StudentExerciseLog;
import com.edtech.model.mapper.QuestionMapper;
import com.edtech.model.mapper.StudentExerciseLogMapper;
import com.edtech.web.service.MistakeBookService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/practice")
@RequiredArgsConstructor
@Slf4j
public class PracticeController {

    private final QuestionMapper questionMapper;
    private final StudentExerciseLogMapper logMapper;
    private final KnowledgeTracingService ktService;
    private final MistakeBookService mistakeBookService;

    @GetMapping("/random")
    public Question getRandomQuestion() {
        // Simple implementation: get all and pick one
        List<Question> questions = questionMapper.selectList(null);
        if (questions.isEmpty()) {
            Question mock = new Question();
            mock.setId(1L);
            mock.setContent("What is the capital of France?");
            mock.setOptions("[\"London\", \"Berlin\", \"Paris\", \"Madrid\"]");
            mock.setCorrectAnswer("C");
            mock.setType(1);
            return mock;
        }
        // Return a random one
        int index = (int) (Math.random() * questions.size());
        return questions.get(index);
    }

    @PostMapping("/submit")
    public void submitAnswer(@RequestBody SubmitRequest request) {
        log.info("Received submission: {}", request);

        // 1. Save Log
        StudentExerciseLog exerciseLog = new StudentExerciseLog();
        exerciseLog.setStudentId(request.getStudentId());
        exerciseLog.setQuestionId(request.getQuestionId());
        exerciseLog.setResult(request.getIsCorrect() ? 1 : 0);
        exerciseLog.setDuration(request.getDuration());
        exerciseLog.setSubmitTime(LocalDateTime.now());
        logMapper.insert(exerciseLog);

        // 2. Trigger BKT Update
        ktService.updateKnowledgeState(request.getStudentId(), request.getQuestionId(), request.getIsCorrect());

        // 3. Update Mistake Book (if wrong)
        if (!request.getIsCorrect()) {
            mistakeBookService.addMistake(request.getStudentId(), request.getQuestionId());
        }
    }

    @Data
    public static class SubmitRequest {
        private Long studentId;
        private Long questionId;
        private Boolean isCorrect;
        private Integer duration;
    }
}
