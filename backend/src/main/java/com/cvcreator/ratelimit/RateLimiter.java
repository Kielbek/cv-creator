package com.cvcreator.ratelimit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory fixed-window limiter (per minute and per day). Enough for a single instance; with several instances
 * move the counters to Redis.
 */
@Component
public class RateLimiter {

    private static final long MINUTE = 60_000L;
    private static final long DAY = 86_400_000L;

    private final RateLimitProperties props;
    private final Clock clock;
    private final Map<String, Counter> counters = new ConcurrentHashMap<>();

    @Autowired
    public RateLimiter(RateLimitProperties props) {
        this(props, Clock.systemUTC());
    }

    RateLimiter(RateLimitProperties props, Clock clock) {
        this.props = props;
        this.clock = clock;
    }

    /** @return 0 if allowed, otherwise seconds until the client may retry */
    public long tryAcquire(String key) {
        long now = clock.millis();
        if (counters.size() > 50_000) {
            evict(now);
        }
        Counter c = counters.computeIfAbsent(key, k -> new Counter());
        synchronized (c) {
            if (now - c.minuteStart >= MINUTE) {
                c.minuteStart = now;
                c.minuteCount = 0;
            }
            if (now - c.dayStart >= DAY) {
                c.dayStart = now;
                c.dayCount = 0;
            }
            if (c.dayCount >= props.perDay()) {
                return Math.max(1, (c.dayStart + DAY - now) / 1000);
            }
            if (c.minuteCount >= props.perMinute()) {
                return Math.max(1, (c.minuteStart + MINUTE - now) / 1000);
            }
            c.minuteCount++;
            c.dayCount++;
            return 0;
        }
    }

    private void evict(long now) {
        for (Iterator<Counter> it = counters.values().iterator(); it.hasNext(); ) {
            if (now - it.next().dayStart >= DAY) {
                it.remove();
            }
        }
    }

    private static final class Counter {
        long minuteStart;
        long dayStart;
        int minuteCount;
        int dayCount;
    }
}
