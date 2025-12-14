package com.edtech.core.mq;

import com.edtech.core.config.RabbitConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class PracticeProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendPracticeLog(Long studentId, Long questionId, boolean isCorrect, int duration) {
        Map<String, Object> message = new HashMap<>();
        message.put("studentId", studentId);
        message.put("questionId", questionId);
        message.put("isCorrect", isCorrect);
        message.put("duration", duration);
        message.put("submitTime", LocalDateTime.now().toString());

        log.info("Sending practice log for student: {}, question: {}", studentId, questionId);
        rabbitTemplate.convertAndSend(RabbitConfig.PRACTICE_LOG_QUEUE, message);
    }
}
