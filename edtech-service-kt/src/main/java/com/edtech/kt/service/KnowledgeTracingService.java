package com.edtech.kt.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.edtech.model.entity.KnowledgePoint;
import com.edtech.model.entity.KnowledgeState;
import com.edtech.model.entity.Question;
import com.edtech.model.mapper.KnowledgePointMapper;
import com.edtech.model.mapper.KnowledgeStateMapper;
import com.edtech.model.mapper.QuestionMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
@RequiredArgsConstructor
public class KnowledgeTracingService {

    private final KnowledgeStateMapper knowledgeStateMapper;
    private final QuestionMapper questionMapper;
    private final KnowledgePointMapper knowledgePointMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    // Default BKT Parameters (Fallback)
    private static final double DEFAULT_P_INIT = 0.1;
    private static final double DEFAULT_P_TRANSIT = 0.1;
    private static final double DEFAULT_P_GUESS = 0.2;
    private static final double DEFAULT_P_SLIP = 0.1;

    /**
     * 更新学生知识状态 (BKT Algorithm)
     *
     * @param studentId  学生ID
     * @param questionId 题目ID
     * @param isCorrect  是否正确
     */
    @Transactional(rollbackFor = Exception.class)
    public void updateKnowledgeState(Long studentId, Long questionId, boolean isCorrect) {
        log.info("Starting BKT for Student: {}, Question: {}, Correct: {}", studentId, questionId, isCorrect);

        // 1. Get Question & Knowledge Point
        Question question = questionMapper.selectById(questionId);
        if (question == null) {
            log.warn("Question not found: {}", questionId);
            return;
        }
        Long kpId = question.getKnowledgePointId();
        KnowledgePoint kp = knowledgePointMapper.selectById(kpId);

        // 2. Get BKT Parameters
        double pInit = kp.getPInit() != null ? kp.getPInit() : DEFAULT_P_INIT;
        double pTransit = kp.getPTransit() != null ? kp.getPTransit() : DEFAULT_P_TRANSIT;
        double pGuess = kp.getPGuess() != null ? kp.getPGuess() : DEFAULT_P_GUESS;
        double pSlip = kp.getPSlip() != null ? kp.getPSlip() : DEFAULT_P_SLIP;

        // 3. Get Current State (From Redis L1 or DB L2)
        String stateKey = "student:state:" + studentId;
        Double currentProb = (Double) redisTemplate.opsForHash().get(stateKey, kpId.toString());

        if (currentProb == null) {
            KnowledgeState dbState = knowledgeStateMapper.selectOne(new LambdaQueryWrapper<KnowledgeState>()
                    .eq(KnowledgeState::getStudentId, studentId)
                    .eq(KnowledgeState::getKnowledgePointId, kpId));
            
            // If no previous state, use P(L0)
            currentProb = (dbState != null) ? dbState.getMasteryProbability().doubleValue() : pInit;
        }

        // 4. Calculate New Probability using BKT
        double newProb = calculateNewProbabilityBKT(currentProb, isCorrect, pTransit, pGuess, pSlip);

        // 5. Update Redis (L1 Cache)
        redisTemplate.opsForHash().put(stateKey, kpId.toString(), newProb);
        redisTemplate.expire(stateKey, 7, TimeUnit.DAYS);

        // 6. Write Back to DB (L2 Persistence)
        saveStateToDb(studentId, kpId, newProb);

        log.info("Updated Knowledge State (BKT) for Student: {}, KP: {}, Old: {}, New: {}", studentId, kpId, currentProb, newProb);
    }

    /**
     * Standard Bayesian Knowledge Tracing (BKT)
     *
     * P(L_t | Result) = posterior probability given result
     * P(L_t+1) = P(L_t | Result) + (1 - P(L_t | Result)) * P(T)
     */
    private double calculateNewProbabilityBKT(double pL, boolean isCorrect, double pT, double pG, double pS) {
        double posterior;

        if (isCorrect) {
            // Correct answer: P(L | Correct) = (P(L) * (1 - P(S))) / (P(L) * (1 - P(S)) + (1 - P(L)) * P(G))
            double num = pL * (1 - pS);
            double den = num + (1 - pL) * pG;
            posterior = den == 0 ? 0 : num / den;
        } else {
            // Wrong answer: P(L | Wrong) = (P(L) * P(S)) / (P(L) * P(S) + (1 - P(L)) * (1 - P(G)))
            double num = pL * pS;
            double den = num + (1 - pL) * (1 - pG);
            posterior = den == 0 ? 0 : num / den;
        }

        // Transition: P(L_t+1) = Posterior + (1 - Posterior) * P(T)
        double nextProb = posterior + (1 - posterior) * pT;
        
        // Clamp to avoid 1.0 or 0.0 purely
        return Math.max(0.0001, Math.min(0.9999, nextProb));
    }

    private void saveStateToDb(Long studentId, Long kpId, double prob) {
        KnowledgeState state = knowledgeStateMapper.selectOne(new LambdaQueryWrapper<KnowledgeState>()
                .eq(KnowledgeState::getStudentId, studentId)
                .eq(KnowledgeState::getKnowledgePointId, kpId));

        if (state == null) {
            state = new KnowledgeState();
            state.setStudentId(studentId);
            state.setKnowledgePointId(kpId);
        }
        state.setMasteryProbability(BigDecimal.valueOf(prob));
        
        if (state.getId() == null) {
            knowledgeStateMapper.insert(state);
        } else {
            knowledgeStateMapper.updateById(state);
        }
    }
}
