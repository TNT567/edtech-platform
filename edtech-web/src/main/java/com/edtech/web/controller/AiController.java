package com.edtech.web.controller;

import com.edtech.ai.service.ContentGenerationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
public class AiController {

    private final ContentGenerationService contentGenerationService;

    @PostMapping("/explain")
    public Map<String, String> explainQuestion(@RequestBody ExplainRequest request) {
        log.info("Requesting explanation for question: {}", request.getQuestionContent());
        
        String explanation = contentGenerationService.generateExplanation(
                request.getQuestionContent(),
                request.getWrongAnswer(),
                request.getCorrectAnswer()
        );

        Map<String, String> response = new HashMap<>();
        response.put("explanation", explanation);
        return response;
    }

    @Data
    public static class ExplainRequest {
        private String questionContent;
        private String wrongAnswer;
        private String correctAnswer;
    }
}
