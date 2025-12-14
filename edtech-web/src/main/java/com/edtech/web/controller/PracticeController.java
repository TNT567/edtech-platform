package com.edtech.web.controller;

import com.edtech.ai.model.GeneratedQuestionVO;
import com.edtech.ai.service.ContentGenerationService;
import com.edtech.core.util.RedisUtils;
import com.edtech.kt.service.KnowledgeTracingService;
import com.edtech.model.entity.Question;
import com.edtech.model.entity.StudentExerciseLog;
import com.edtech.model.mapper.StudentExerciseLogMapper;
import com.edtech.web.service.MistakeBookService;
import com.edtech.web.service.strategy.PracticeStrategyService;
import com.edtech.web.service.strategy.SpacedRepetitionService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/practice")
@RequiredArgsConstructor
@Slf4j
public class PracticeController {

    private final StudentExerciseLogMapper logMapper;
    private final KnowledgeTracingService ktService;
    private final MistakeBookService mistakeBookService;
    private final PracticeStrategyService strategyService;
    private final SpacedRepetitionService sm2Service;
    private final RedisUtils redisUtils;
    private final ContentGenerationService contentService;

    @GetMapping("/random")
    public Map<String, Object> getRandomQuestion() {
        // Use new Strategy Engine
        Long studentId = 1L; // Mock student
        PracticeStrategyService.QuestionSelection selection = strategyService.selectNextQuestion(studentId);
        
        Map<String, Object> response = new HashMap<>();
        if (selection != null && selection.question() != null) {
            response.put("data", selection.question());
            response.put("strategy", selection.strategyName());
            response.put("strategyCode", selection.strategyCode());
        }
        return response;
    }

    @GetMapping("/generate")
    public Map<String, Object> generateQuestion(
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) Long knowledgePointId,
            @RequestParam(required = false) String difficulty) {
        
        Map<String, Object> response = new HashMap<>();
        
        if (knowledgePointId != null) {
            // Targeted generation via AI
            // In a real scenario, we would fetch KP name from DB
            String kpName = "Knowledge Point " + knowledgePointId; 
            
            // Generate using AI
            GeneratedQuestionVO vo = contentService.generateRemedialQuestion(
                kpName, 
                0.5, // Default mastery if unknown
                "None", 
                "None", 
                0
            );
            
            // Convert VO to Map for frontend compatibility (avoiding Entity limitations)
            Map<String, Object> qMap = new HashMap<>();
            qMap.put("id", System.currentTimeMillis()); // Temp ID
            qMap.put("content", vo.getStem());
            qMap.put("options", vo.getOptions()); // List<String> is fine for JSON
            qMap.put("correctAnswer", vo.getCorrectAnswer());
            qMap.put("analysis", vo.getAnalysis());
            qMap.put("knowledgePointId", knowledgePointId);
            
            response.put("data", qMap);
            response.put("strategy", "专项突破 (AI实时生成)");
            response.put("strategyCode", "MANUAL");
        } else {
            // Fallback to strategy engine if no specific KP
            return getRandomQuestion();
        }
        
        return response;
    }

    @PostMapping("/submit")
    public void submitAnswer(@RequestBody SubmitRequest request) {
        log.info("Received submission: {}", request);
        Long studentId = request.getStudentId();
        Long questionId = request.getQuestionId();

        // 1. Save Log (Sync for now, move to MQ later as requested)
        StudentExerciseLog exerciseLog = new StudentExerciseLog();
        exerciseLog.setStudentId(studentId);
        exerciseLog.setQuestionId(questionId);
        exerciseLog.setResult(request.getIsCorrect() ? 1 : 0);
        exerciseLog.setDuration(request.getDuration());
        exerciseLog.setSubmitTime(LocalDateTime.now());
        logMapper.insert(exerciseLog);

        // 2. Trigger BKT Update
        ktService.updateKnowledgeState(studentId, questionId, request.getIsCorrect());

        // 3. Update Strategy State (Redis)
        String wrongFreqKey = String.format("student:%s:wrong_freq", studentId);
        String drillKey = String.format("student:%s:drill_mode", studentId);
        String reviewKey = String.format("student:%s:review_due", studentId);

        if (!request.getIsCorrect()) {
            // Wrong: Add to mistake book, increment freq, trigger drill
            mistakeBookService.addMistake(studentId, questionId);
            redisUtils.zIncrementScore(wrongFreqKey, questionId.toString(), 1.0);
            
            // Set Drill Mode: Target this KP
            redisUtils.set(drillKey, 101L, 10, java.util.concurrent.TimeUnit.MINUTES); // Mock KP ID logic
            
            // Reset SM-2 interval
            long nextReview = sm2Service.calculateNextReviewTime(0, 0, 0);
            redisUtils.zAdd(reviewKey, questionId.toString(), nextReview);
        } else {
            // Correct: Check drill mode exit
            Object drillKp = redisUtils.get(drillKey);
            if (drillKp != null) {
                // If consecutive correct >= 2 (Logic simplified for demo)
                redisUtils.delete(drillKey);
            }
            
            // Update SM-2 (Mocking previous interval/reps for now)
            long nextReview = sm2Service.calculateNextReviewTime(1, 1, 4);
            redisUtils.zAdd(reviewKey, questionId.toString(), nextReview);
        }
        
        // 4. Async Log (Mock MQ send)
        // rabbitTemplate.convertAndSend("practice.exchange", "log.key", exerciseLog);
    }

    @Data
    public static class SubmitRequest {
        private Long studentId;
        private Long questionId;
        private Boolean isCorrect;
        private Integer duration;
    }
}
