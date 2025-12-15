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

    public GeneratedQuestionVO generateRemedialQuestion(String kpName, double probability, String commonMistakes, String lastWrong, long daysSinceReview, String difficultyOption) {
        log.info("🎯 AI动态出题: 知识点={}, 掌握度={:.2f}, 难度={}", kpName, probability, difficultyOption);

        // 动态难度策略
        String difficultyLevel;
        String difficultyPrompt;
        if (difficultyOption != null) {
            switch (difficultyOption) {
                case "Easy" -> {
                    difficultyLevel = "基础巩固";
                    difficultyPrompt = "题目应该直接考查基本概念和公式应用，计算步骤不超过3步，避免复杂变形";
                }
                case "Hard" -> {
                    difficultyLevel = "综合提升";
                    difficultyPrompt = "题目应该综合多个知识点，需要深入分析和多步推理，包含一定的技巧性";
                }
                default -> {
                    difficultyLevel = "适中练习";
                    difficultyPrompt = "题目难度适中，需要理解概念并进行适当计算，有一定思维量但不过分复杂";
                }
            }
        } else {
            // 根据掌握度自动调整
            if (probability < 0.4) {
                difficultyLevel = "基础巩固";
                difficultyPrompt = "重点巩固基础，题目简单直接，帮助建立信心";
            } else if (probability > 0.8) {
                difficultyLevel = "挑战进阶";
                difficultyPrompt = "适当增加难度，拓展思维，防止知识遗忘";
            } else {
                difficultyLevel = "稳步提升";
                difficultyPrompt = "在现有基础上适度提升，循序渐进";
            }
        }

        // 最佳动态Prompt模板
        String userPrompt = StrUtil.format("""
                # 角色设定
                你是一位拥有20年教学经验的高中数学特级教师，专精个性化教学和因材施教。
                
                # 学生画像分析
                - **目标知识点**: {}
                - **当前掌握水平**: {:.1%} (0%=完全不会, 100%=完全掌握)
                - **历史学习误区**: {}
                - **最近错误情况**: {}
                - **复习时机**: 距离上次学习已{}天
                - **本次目标**: {} - {}
                
                # 出题要求
                1. **针对性**: 根据掌握水平{:.1%}，精准定位学生当前需要突破的点
                2. **误区设计**: 干扰选项必须体现该知识点的典型错误思路
                3. **LaTeX支持**: 数学公式使用标准LaTeX格式，如 $\\frac{{a}}{{b}}$, $\\sqrt{{x}}$
                4. **实用性**: 题目贴近高考真题风格，有实际教学价值
                5. **渐进性**: 难度与学生水平匹配，既有挑战性又不会打击信心
                
                # 输出格式 (严格JSON)
                {{
                  "content": "题干内容(支持LaTeX公式)",
                  "options": ["A. 选项内容", "B. 选项内容", "C. 选项内容", "D. 选项内容"],
                  "correctAnswer": "A",
                  "analysis": "详细解析(包含解题思路、易错点分析、知识点总结)",
                  "difficulty": "{}",
                  "type": 1
                }}
                
                请立即生成一道高质量的数学选择题:
                """, 
                kpName, probability, commonMistakes, lastWrong, daysSinceReview, 
                difficultyLevel, difficultyPrompt, probability, difficultyLevel);

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
