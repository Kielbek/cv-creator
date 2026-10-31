package com.cvcreator.ai;

/** One structured request to the language model. Separated from {@link CvAiService} so tests can use a fake. */
public interface AiGateway {

    boolean available();

    /**
     * @param system   instructions (stable across calls → cache-friendly)
     * @param user     the per-request payload
     * @param type     record the answer is parsed into (its JSON schema is sent as the output format)
     */
    <T> T generate(String system, String user, Class<T> type);

    /** Same, with a PDF document (base64) placed before the text of the user message. */
    <T> T generateWithPdf(String system, String pdfBase64, String user, Class<T> type);
}
