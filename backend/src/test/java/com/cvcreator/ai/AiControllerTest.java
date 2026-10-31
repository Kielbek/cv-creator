package com.cvcreator.ai;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Without an API key the app must start, report AI as disabled and answer AI calls with 503. */
@SpringBootTest(properties = {"app.ai.api-key=", "app.rate-limit.per-minute=100"})
@AutoConfigureMockMvc
class AiControllerTest {

    @Autowired
    MockMvc mvc;

    @Test
    void statusReportsDisabled() throws Exception {
        mvc.perform(get("/api/v1/ai/status")).andExpect(status().isOk()).andExpect(jsonPath("$.enabled").value(false));
    }

    @Test
    void validRequestWithoutKeyIs503() throws Exception {
        mvc.perform(post("/api/v1/ai/improve").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"language\":\"en\",\"text\":\"Did backend stuff\"}"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("ai_unavailable"));
    }

    @Test
    void invalidRequestIs400() throws Exception {
        mvc.perform(post("/api/v1/ai/improve").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"language\":\"english\",\"text\":\"\"}"))
                .andExpect(status().isBadRequest());
    }
}
