package com.edtech.ai.service;

import cn.hutool.core.util.StrUtil;
import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.edtech.ai.model.GeneratedQuestionVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class ContentGenerationService {

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    @Value("${spring.ai.openai.base-url:https://dashscope.aliyuncs.com/compatible-mode}")
    private String baseUrl;

    private static final String MODEL = "qwen-plus";

    /**
     * 根据知识点和掌握度生成补习题目
     */
    public GeneratedQuestionVO generateRemedialQuestion(String knowledgePointName, double currentMastery) {
        log.info("Generating content for KP: {}, Mastery: {}", knowledgePointName, currentMastery);

        String difficultyLevel = currentMastery < 0.4 ? "BASIC (Easy)" : "ADVANCED (Hard)";
        String learningGoal = currentMastery < 0.4 ? "Focus on definitions and basic concepts." : "Focus on complex application and synthesis.";

        // Manual JSON Schema for Output
        String formatExample = """
                {
                  "content": "Question stem here...",
                  "options": ["Option A", "Option B", "Option C", "Option D"],
                  "correctAnswer": "A",
                  "analysis": "Explanation here...",
                  "difficulty": 0.5,
                  "type": 1
                }
                """;

        String userPrompt = StrUtil.format("""
                Role: You are an expert AI tutor.
                Task: Generate a single multiple-choice question for the knowledge point: {}.
                Student State: Mastery level is {} (scale 0-1).
                Requirement:
                - Difficulty: {}
                - Goal: {}
                - Language: Chinese (Simplified) for content, but keep JSON structure keys in English.
                - Format: Return ONLY valid JSON matching this example: {}
                """, knowledgePointName, currentMastery, difficultyLevel, learningGoal, formatExample);

        String response = callQwen(userPrompt);

        // Parse Response
        try {
            // Cleanup markdown code blocks if present
            if (response.startsWith("```json")) {
                response = response.substring(7);
            }
            if (response.startsWith("```")) {
                response = response.substring(3);
            }
            if (response.endsWith("```")) {
                response = response.substring(0, response.length() - 3);
            }
            
            JSONObject json = JSONUtil.parseObj(response);
            GeneratedQuestionVO vo = new GeneratedQuestionVO();
            vo.setStem(json.getStr("content")); // JSON key is content, VO field is stem
            
            JSONArray opts = json.getJSONArray("options");
            if (opts != null) {
                vo.setOptions(opts.toList(String.class));
            }
            vo.setCorrectAnswer(json.getStr("correctAnswer"));
            vo.setAnalysis(json.getStr("analysis"));
            // vo.setDifficulty(json.getStr("difficulty")); // Might be Double in JSON but String in VO?
            
            return vo;

        } catch (Exception e) {
            log.error("Failed to parse AI response: {}", response, e);
            throw new RuntimeException("Content generation failed", e);
        }
    }

    /**
     * 智能讲解错题
     */
    public String generateExplanation(String questionContent, String wrongAnswer, String correctAnswer) {
        log.info("Generating explanation...");

        String userPrompt = StrUtil.format("""
                Role: You are a patient and knowledgeable AI tutor.
                Task: Explain why the student's answer is wrong and provide a detailed derivation for the correct answer.
                Question: {}
                Student's Wrong Answer: {}
                Correct Answer: {}
                
                Requirements:
                1. Analyze the likely misconception in the wrong answer.
                2. Provide step-by-step derivation for the correct answer.
                3. Create a similar but simpler example question to reinforce the concept.
                4. Output Format: Markdown (Use LaTeX for math).
                5. Language: Chinese (Simplified).
                """, questionContent, wrongAnswer, correctAnswer);

        return callQwen(userPrompt);
    }

    private String callQwen(String prompt) {
        String url = baseUrl + "/v1/chat/completions";
        
        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);

        Map<String, Object> body = new HashMap<>();
        body.put("model", MODEL);
        body.put("messages", List.of(message));
        body.put("temperature", 0.7);

        try (HttpResponse response = HttpRequest.post(url)
                .header("Authorization", "Bearer " + apiKey)
                .body(JSONUtil.toJsonStr(body))
                .execute()) {

            if (!response.isOk()) {
                log.error("AI API Error: {}", response.body());
                throw new RuntimeException("AI API Call Failed: " + response.getStatus());
            }

            JSONObject json = JSONUtil.parseObj(response.body());
            return json.getJSONArray("choices")
                    .getJSONObject(0)
                    .getJSONObject("message")
                    .getStr("content");
        }
    }
}
