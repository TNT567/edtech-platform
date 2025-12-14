package com.edtech.web.service.payment;

import java.math.BigDecimal;

public interface PaymentStrategy {
    String createOrder(String orderId, BigDecimal amount, String currency);
    boolean verifyPayment(String transactionId);
    String getProviderName();
}
