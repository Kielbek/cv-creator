package com.cvcreator.ratelimit;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimiterTest {

    @Test
    void limitsPerMinuteAndPerDay() {
        AtomicLong now = new AtomicLong(1_000_000);
        Clock clock = new Clock() {
            public ZoneOffset getZone() { return ZoneOffset.UTC; }
            public Clock withZone(java.time.ZoneId zone) { return this; }
            public Instant instant() { return Instant.ofEpochMilli(now.get()); }
        };
        RateLimiter limiter = new RateLimiter(new RateLimitProperties(2, 3), clock);

        assertThat(limiter.tryAcquire("a")).isZero();
        assertThat(limiter.tryAcquire("a")).isZero();
        assertThat(limiter.tryAcquire("a")).isPositive();      // 3rd in the same minute
        assertThat(limiter.tryAcquire("b")).isZero();          // other client unaffected

        now.addAndGet(61_000);
        assertThat(limiter.tryAcquire("a")).isZero();          // new minute, 3rd today
        now.addAndGet(61_000);
        assertThat(limiter.tryAcquire("a")).isGreaterThan(3600); // daily quota spent
    }
}
