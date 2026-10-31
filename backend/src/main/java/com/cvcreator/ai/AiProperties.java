package com.cvcreator.ai;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Claude API settings. An empty {@code apiKey} switches the AI features off: the editor keeps working, the AI
 * buttons answer 503 and the frontend hides them (see {@code GET /api/v1/ai/status}).
 */
@ConfigurationProperties("app.ai")
public record AiProperties(
        String apiKey,
        @DefaultValue("claude-opus-5-5") String model,
        @DefaultValue("8000") long maxTokens,
        /* Server-side refusal fallback (beta). Turn off if your account/platform does not support it. */
        @DefaultValue("true") boolean fallbacks) {

    public boolean enabled() {
        return apiKey != null && !apiKey.isBlank();
    }
}
