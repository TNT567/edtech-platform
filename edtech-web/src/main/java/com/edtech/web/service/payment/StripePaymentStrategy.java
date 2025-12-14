package com.edtech.web.service.payment;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service("stripePaymentStrategy")
@Slf4j
public class StripePaymentStrategy implements PaymentStrategy {
    @Override
    public String createOrder(String orderId, BigDecimal amount, String currency) {
        log.info("Creating Stripe Payment Intent for Order: {}, Amount: {}", orderId, amount);
        // Stripe API integration would go here
        return "pi_mock_stripe_client_secret";
    }

    @Override
    public boolean verifyPayment(String transactionId) {
        return true;
    }

    @Override
    public String getProviderName() {
        return "STRIPE";
    }
}
