package com.cvcreator.ai;

import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.anthropic.core.JsonValue;
import com.anthropic.errors.AnthropicIoException;
import com.anthropic.errors.AnthropicServiceException;
import com.anthropic.errors.BadRequestException;
import com.anthropic.errors.RateLimitException;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.OutputConfig;
import com.anthropic.models.messages.StopReason;
import com.anthropic.models.messages.StructuredMessage;
import com.anthropic.models.messages.StructuredMessageCreateParams;
import com.anthropic.models.messages.StructuredOutputConfig;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class ClaudeAiGateway implements AiGateway {

    private static final Logger log = LoggerFactory.getLogger(ClaudeAiGateway.class);
    private static final String FALLBACK_BETA = "server-side-fallback-2026-07-01";

    private final AiProperties props;
    private final AnthropicClient client;

    public ClaudeAiGateway(AiProperties props) {
        this.props = props;
        this.client = props.enabled()
                ? AnthropicOkHttpClient.builder().apiKey(props.apiKey()).timeout(Duration.ofSeconds(120)).build()
                : null;
        log.info("AI features {} (model {})", props.enabled() ? "enabled" : "disabled - set ANTHROPIC_API_KEY", props.model());
    }

    @Override
    public boolean available() {
        return client != null;
    }

    @Override
    public <T> T generate(String system, String user, Class<T> type) {
        if (client == null) {
            throw new AiUnavailableException("AI is not configured");
        }
        StructuredMessageCreateParams.Builder<T> builder = MessageCreateParams.builder()
                .model(props.model())
                .maxTokens(props.maxTokens())
                .system(system)
                .outputConfig(StructuredOutputConfig.<T>builder()
                        .format(type)
                        // Editing CV text is a short, well-specified task: low effort keeps it fast and cheap.
                        .effort(OutputConfig.Effort.LOW)
                        .build())
                .addUserMessage(user);
        if (props.fallbacks()) {
            // If the safety classifier declines, the API retries on a suitable model instead of failing the request.
            builder.putAdditionalHeader("anthropic-beta", FALLBACK_BETA)
                    .putAdditionalBodyProperty("fallbacks", JsonValue.from("default"));
        }
        try {
            StructuredMessage<T> message = client.messages().create(builder.build());
            if (message.stopReason().filter(StopReason.REFUSAL::equals).isPresent()) {
                throw new AiUnavailableException("The AI declined this request");
            }
            if (message.stopReason().filter(StopReason.MAX_TOKENS::equals).isPresent()) {
                throw new AiUnavailableException("The AI answer was too long - try a shorter text");
            }
            return message.content().stream()
                    .flatMap(block -> block.text().stream())
                    .map(text -> text.text())
                    .findFirst()
                    .orElseThrow(() -> new AiUnavailableException("Empty AI answer"));
        } catch (RateLimitException e) {
            throw new AiUnavailableException("AI is busy - please try again in a minute", e);
        } catch (BadRequestException e) {
            log.error("Claude rejected the request: {}", e.getMessage());
            throw new AiUnavailableException("AI request rejected", e);
        } catch (AnthropicServiceException e) {
            log.warn("Claude API error {}: {}", e.statusCode(), e.getMessage());
            throw new AiUnavailableException("AI service error", e);
        } catch (AnthropicIoException e) {
            log.warn("Claude API unreachable: {}", e.getMessage());
            throw new AiUnavailableException("AI service unreachable", e);
        }
    }

    @PreDestroy
    void close() {
        if (client != null) {
            client.close();
        }
    }
}
