package com.edtech.web.service.strategy;

import com.edtech.core.util.RedisUtils;
import com.edtech.model.entity.KnowledgePoint;
import com.edtech.model.entity.Question;
import com.edtech.model.mapper.KnowledgePointMapper;
import com.edtech.model.mapper.QuestionMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;

@Service
@Slf4j
@RequiredArgsConstructor
public class PracticeStrategyService {

    private final RedisUtils redisUtils;
    private final QuestionMapper questionMapper;
    private final KnowledgePointMapper knowledgePointMapper;

    private static final String KEY_DRILL_MODE = "student:%s:drill_mode";
    private static final String KEY_WRONG_FREQ = "student:%s:wrong_freq";
    private static final String KEY_WEAK_KPS = "student:%s:weak_kps";
    private static final String KEY_REVIEW_DUE = "student:%s:review_due";
    private static final String KEY_MASTERY = "student:%s:mastery";

    public QuestionSelection selectNextQuestion(Long studentId) {
        // 1. Check Drill Mode (Highest Priority)
        String drillKey = String.format(KEY_DRILL_MODE, studentId);
        Object drillKpId = redisUtils.get(drillKey);
        if (drillKpId != null) {
            log.info("Student {} in Drill Mode for KP {}", studentId, drillKpId);
            return new QuestionSelection(getQuestionByKp(Long.parseLong(drillKpId.toString())), "CORRECTION_DRILL", "纠错专项训练");
        }

        // 2. Weighted Strategy Selection
        int roll = ThreadLocalRandom.current().nextInt(100);
        
        // Strategy A: High Frequency Mistakes (40%)
        if (roll < 40) {
            Set<Object> wrongKps = redisUtils.zReverseRange(String.format(KEY_WRONG_FREQ, studentId), 0, 9);
            if (!wrongKps.isEmpty()) {
                Object kpId = getRandomElement(wrongKps);
                return new QuestionSelection(getQuestionByKp(Long.parseLong(kpId.toString())), "HIGH_FREQ_WRONG", "高频错题重练");
            }
        }

        // Strategy B: Weak Points (30%)
        if (roll < 70) {
            // Weakest: Score (1-prob) is high
            Set<Object> weakKps = redisUtils.zReverseRange(String.format(KEY_WEAK_KPS, studentId), 0, 4);
            if (!weakKps.isEmpty()) {
                Object kpId = getRandomElement(weakKps);
                return new QuestionSelection(getQuestionByKp(Long.parseLong(kpId.toString())), "WEAK_POINT", "薄弱知识点击破");
            }
        }

        // Strategy C: Spaced Repetition (15%)
        if (roll < 85) {
            double now = System.currentTimeMillis() / 1000.0;
            Set<Object> dueKps = redisUtils.zRangeByScore(String.format(KEY_REVIEW_DUE, studentId), 0, now);
            if (!dueKps.isEmpty()) {
                Object kpId = getRandomElement(dueKps);
                return new QuestionSelection(getQuestionByKp(Long.parseLong(kpId.toString())), "SPACED_REPETITION", "艾宾浩斯记忆唤醒");
            }
        }

        // Strategy D: Advanced (10%)
        if (roll < 95) {
            // Need to scan mastery hash or use another ZSet. For simplicity, fallback to random if complex query needed.
            // Assuming we have a ZSet for high mastery too or just random pick.
            // Let's pick a random KP and check mastery.
            // Fallback: Just return random advanced.
        }

        // Default: Random / Exploration (5% or Fallback)
        return new QuestionSelection(getRandomQuestion(), "EXPLORATION", "探索新知");
    }

    private Question getQuestionByKp(Long kpId) {
        // Ideally select by difficulty dynamically. Here simplified.
        List<Question> questions = questionMapper.selectByMap(java.util.Map.of("knowledge_point_id", kpId));
        if (questions.isEmpty()) return getRandomQuestion(); // Fallback
        return questions.get(ThreadLocalRandom.current().nextInt(questions.size()));
    }

    private Question getRandomQuestion() {
        List<Question> list = questionMapper.selectList(null);
        if (list.isEmpty()) return null;
        return list.get(ThreadLocalRandom.current().nextInt(list.size()));
    }

    private Object getRandomElement(Set<Object> set) {
        int index = ThreadLocalRandom.current().nextInt(set.size());
        int i = 0;
        for (Object obj : set) {
            if (i == index) return obj;
            i++;
        }
        return set.iterator().next();
    }

    public record QuestionSelection(Question question, String strategyCode, String strategyName) {}
}
