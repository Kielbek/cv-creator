package com.cvcreator.ratelimit;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/** The app is free, so AI calls are limited per client IP to keep the API bill predictable. */
@ConfigurationProperties("app.rate-limit")
public record RateLimitProperties(
        @DefaultValue("8") int perMinute,
        @DefaultValue("60") int perDay) {
}
