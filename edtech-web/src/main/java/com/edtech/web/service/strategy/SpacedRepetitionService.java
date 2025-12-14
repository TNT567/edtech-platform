package com.edtech.web.service.strategy;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@Slf4j
public class SpacedRepetitionService {

    /**
     * Calculate next review interval using simplified SM-2 Algorithm
     *
     * @param previousInterval Days since last review (0 for new)
     * @param repetitionCount  How many times reviewed consecutively correct
     * @param quality          0-5 scale (0=blackout, 3=pass, 5=perfect)
     *                         In our system: Wrong=0, Correct=4 (simplification)
     * @return Next review timestamp (epoch seconds)
     */
    public long calculateNextReviewTime(int previousInterval, int repetitionCount, int quality) {
        int nextInterval;

        if (quality < 3) {
            // If wrong, reset interval
            nextInterval = 1; 
        } else {
            if (repetitionCount == 0) {
                nextInterval = 1;
            } else if (repetitionCount == 1) {
                nextInterval = 6;
            } else {
                // EF factor logic simplified: ~2.5 multiplier
                double ef = 2.5; 
                nextInterval = (int) Math.round(previousInterval * ef);
            }
        }

        // Add interval to current time
        return Instant.now().plus(nextInterval, ChronoUnit.DAYS).getEpochSecond();
    }
}
