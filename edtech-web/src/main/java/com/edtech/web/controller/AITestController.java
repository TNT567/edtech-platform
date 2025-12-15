package com.edtech.web.controller;

import com.edtech.ai.service.ContentGenerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * AI服务测试控制器 - 用于验证AI配置和连接
 */
@RestController
@RequestMapping("/api/ai/test")
@RequiredArgsConstructor
@Slf4j
public class AITestController {

    private final ContentGenerationService contentService;
    
    @Value("${spring.ai.openai.api-key}")
    private String apiKey;
    
    @Value("${spring.ai.openai.base-url}")
    private String baseUrl;

    /**
     * 测试AI服务连接状态
     */
    @GetMapping("/connection")
    public Map<String, Object> testConnection() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 检查配置
            boolean hasValidKey = apiKey != null && !apiKey.startsWith("sk-请在");
            result.put("configValid", hasValidKey);
            result.put("baseUrl", baseUrl);
            result.put("keyConfigured", hasValidKey);
            
            if (!hasValidKey) {
                result.put("status", "CONFIG_ERROR");
                result.put("message", "请在.env文件中配置正确的AI_API_KEY");
                return result;
            }
            
            // 测试简单AI调用
            log.info("🧪 测试AI连接...");
            var testQuestion = contentService.generateRemedialQuestion(
                "测试知识点", 0.5, "无", "无", 0, "Easy"
            );
            
            result.put("status", "SUCCESS");
            result.put("message", "AI服务连接正常");
            result.put("testQuestion", testQuestion.getStem());
            
            log.info("✅ AI连接测试成功");
            
        } catch (Exception e) {
            log.error("❌ AI连接测试失败", e);
            result.put("status", "ERROR");
            result.put("message", "AI服务连接失败: " + e.getMessage());
            result.put("error", e.getClass().getSimpleName());
        }
        
        return result;
    }

    /**
     * 测试不同难度的题目生成
     */
    @PostMapping("/generate-samples")
    public Map<String, Object> generateSamples() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            String[] difficulties = {"Easy", "Medium", "Hard"};
            Map<String, Object> samples = new HashMap<>();
            
            for (String difficulty : difficulties) {
                log.info("🎯 生成{}难度测试题目", difficulty);
                var question = contentService.generateRemedialQuestion(
                    "函数与导数", 0.6, "容易混淆导数和原函数", "选择了错误的求导公式", 3, difficulty
                );
                
                Map<String, Object> questionData = new HashMap<>();
                questionData.put("stem", question.getStem());
                questionData.put("options", question.getOptions());
                questionData.put("correctAnswer", question.getCorrectAnswer());
                questionData.put("analysis", question.getAnalysis());
                
                samples.put(difficulty, questionData);
            }
            
            result.put("status", "SUCCESS");
            result.put("samples", samples);
            result.put("message", "所有难度测试题目生成成功");
            
        } catch (Exception e) {
            log.error("❌ 样本生成失败", e);
            result.put("status", "ERROR");
            result.put("message", "样本生成失败: " + e.getMessage());
        }
        
        return result;
    }
}