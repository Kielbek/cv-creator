package com.cvcreator.ai;

/** AI is switched off, the model declined, or the upstream API failed in a way the user cannot fix. */
public class AiUnavailableException extends RuntimeException {
    public AiUnavailableException(String message) {
        super(message);
    }

    public AiUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
