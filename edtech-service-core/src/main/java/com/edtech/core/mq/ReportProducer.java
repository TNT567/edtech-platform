package com.edtech.core.mq;

import com.edtech.core.config.RabbitConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReportProducer {

    private final RabbitTemplate rabbitTemplate;

    /**
     * 发送生成周报的请求
     *
     * @param studentId 学生ID
     */
    public void sendReportGenerationRequest(Long studentId) {
        Map<String, Object> message = new HashMap<>();
        message.put("studentId", studentId);
        message.put("timestamp", System.currentTimeMillis());
        message.put("type", "WEEKLY_REPORT");

        log.info("Sending report generation request for student: {}", studentId);
        rabbitTemplate.convertAndSend(RabbitConfig.REPORT_QUEUE, message);
    }
}
