package com.edtech.web.controller;

import com.edtech.ai.model.GeneratedQuestionVO;
import com.edtech.ai.service.ContentGenerationService;
import com.edtech.core.util.RedisUtils;
import com.edtech.model.entity.KnowledgePoint;
import com.edtech.model.entity.Question;
import com.edtech.model.mapper.KnowledgePointMapper;
import com.edtech.model.mapper.QuestionMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * AI 动态出题专用控制器
 * 实现真正的实时AI生成，根据学生状态动态调整
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
public class AIQuestionController {

    private final ContentGenerationService contentService;
    private final QuestionMapper questionMapper;
    private final KnowledgePointMapper knowledgePointMapper;
    private final RedisUtils redisUtils;

    /**
     * 核心AI出题接口 - 根据学生状态实时生成
     */
    @PostMapping("/generate-question")
    public Map<String, Object> generateQuestion(@RequestBody GenerateQuestionRequest request) {
        log.info("🎯 AI动态出题请求: studentId={}, subject={}, difficulty={}", 
                request.studentId, request.subject, request.difficulty);
        
        try {
            // 1. 获取知识点信息
            String kpName = "综合练习";
            if (request.knowledgePointId != null) {
                KnowledgePoint kp = knowledgePointMapper.selectById(request.knowledgePointId);
                if (kp != null) {
                    kpName = kp.getName();
                }
            } else if (request.subject != null) {
                kpName = request.subject + " 综合训练";
            }

            // 2. 从Redis获取学生BKT状态和误区信息
            String masteryKey = String.format("student:%s:mastery", request.studentId);
            String mistakeKey = String.format("student:%s:common_mistakes", request.studentId);
            String wrongFreqKey = String.format("student:%s:wrong_freq", request.studentId);
            
            // 获取掌握概率 (默认0.5表示中等水平)
            double probability = 0.5;
            if (request.knowledgePointId != null) {
                Object masteryObj = redisUtils.hGet(masteryKey, request.knowledgePointId.toString());
                if (masteryObj != null) {
                    probability = Double.parseDouble(masteryObj.toString());
                }
            }

            // 获取常见误区
            String commonMistakes = "暂无历史错误记录";
            if (request.knowledgePointId != null) {
                Object mistakeObj = redisUtils.hGet(mistakeKey, request.knowledgePointId.toString());
                if (mistakeObj != null) {
                    commonMistakes = mistakeObj.toString();
                }
            }

            // 获取错题频率
            String lastWrong = "暂无";
            if (request.knowledgePointId != null) {
                Double wrongCount = redisUtils.zScore(wrongFreqKey, request.knowledgePointId.toString());
                if (wrongCount != null && wrongCount > 0) {
                    lastWrong = String.format("该知识点错误%d次", wrongCount.intValue());
                }
            }

            // 计算复习间隔天数 (简化处理)
            long daysSinceReview = 0;
            String difficulty = request.difficulty != null ? request.difficulty : "Medium";

            // 3. 调用AI生成服务
            log.info("🤖 调用AI生成: 知识点={}, 掌握度={}, 难度={}", kpName, probability, difficulty);
            
            GeneratedQuestionVO aiQuestion = contentService.generateRemedialQuestion(
                kpName, 
                probability, 
                commonMistakes, 
                lastWrong, 
                daysSinceReview, 
                difficulty
            );

            // 4. 保存到临时题目表 (可选，用于追踪)
            Question question = new Question();
            question.setContent(aiQuestion.getStem());
            question.setKnowledgePointId(request.knowledgePointId);
            question.setCorrectAnswer(aiQuestion.getCorrectAnswer());
            
            if (aiQuestion.getOptions() != null) {
                question.setOptions(cn.hutool.json.JSONUtil.toJsonStr(aiQuestion.getOptions()));
            }
            
            // 设置难度数值
            BigDecimal difficultyValue = switch (difficulty) {
                case "Easy" -> BigDecimal.valueOf(0.3);
                case "Hard" -> BigDecimal.valueOf(0.8);
                default -> BigDecimal.valueOf(0.5);
            };
            question.setDifficulty(difficultyValue);
            question.setCreatedAt(LocalDateTime.now());
            
            // 标记为AI生成
            question.setType(99); // 99表示AI生成题目
            
            questionMapper.insert(question);

            // 5. 构造返回结果
            Map<String, Object> questionData = new HashMap<>();
            questionData.put("id", question.getId());
            questionData.put("content", aiQuestion.getStem());
            questionData.put("options", aiQuestion.getOptions());
            questionData.put("correctAnswer", aiQuestion.getCorrectAnswer());
            questionData.put("analysis", aiQuestion.getAnalysis());
            questionData.put("knowledgePointId", request.knowledgePointId);
            questionData.put("difficulty", difficulty);
            questionData.put("aiGenerated", true);

            Map<String, Object> response = new HashMap<>();
            response.put("data", questionData);
            response.put("strategy", String.format("🤖 AI智能出题 (%s难度)", difficulty));
            response.put("strategyCode", "AI_GENERATED");
            response.put("studentMastery", probability);
            response.put("knowledgePoint", kpName);
            
            log.info("✅ AI题目生成成功: ID={}, 难度={}", question.getId(), difficulty);
            return response;

        } catch (Exception e) {
            log.error("❌ AI出题失败", e);
            
            // 优雅降级 - 返回友好错误信息
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "🤖 AI正在思考中，请稍后重试...");
            errorResponse.put("retryable", true);
            
            return errorResponse;
        }
    }

    /**
     * AI智能解析接口
     */
    @PostMapping("/explain")
    public Map<String, Object> explainQuestion(@RequestBody ExplainRequest request) {
        log.info("🧠 AI解析请求: 题目长度={}", 
                request.questionContent != null ? request.questionContent.length() : 0);
        
        try {
            String explanation = contentService.generateExplanation(
                request.questionContent,
                request.wrongAnswer,
                request.correctAnswer
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("explanation", explanation);
            response.put("success", true);
            
            return response;
            
        } catch (Exception e) {
            log.error("❌ AI解析失败", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("explanation", "🤖 AI解析服务暂时繁忙，请稍后重试。\n\n**提示**: 请仔细检查题目条件和计算步骤。");
            errorResponse.put("success", false);
            
            return errorResponse;
        }
    }

    // 使用public字段避免Lombok getter/setter问题
    public static class GenerateQuestionRequest {
        public Long studentId;
        public String subject;
        public Long knowledgePointId;
        public String difficulty = "Medium"; // Easy, Medium, Hard
    }

    public static class ExplainRequest {
        public String questionContent;
        public String wrongAnswer;
        public String correctAnswer;
    }
}
