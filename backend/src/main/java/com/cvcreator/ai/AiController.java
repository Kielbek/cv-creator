package com.cvcreator.ai;

import com.cvcreator.ai.AiDtos.CvText;
import com.cvcreator.ai.AiDtos.ImproveRequest;
import com.cvcreator.ai.AiDtos.ImproveResponse;
import com.cvcreator.ai.AiDtos.StatusResponse;
import com.cvcreator.ai.AiDtos.SummaryRequest;
import com.cvcreator.ai.AiDtos.SummaryResponse;
import com.cvcreator.ai.AiDtos.TailorRequest;
import com.cvcreator.ai.AiDtos.TailorResponse;
import com.cvcreator.ai.AiDtos.TranslateRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai")
public class AiController {

    private final CvAiService service;

    public AiController(CvAiService service) {
        this.service = service;
    }

    @GetMapping("/status")
    public StatusResponse status() {
        return new StatusResponse(service.available());
    }

    @PostMapping("/summary")
    public SummaryResponse summary(@Valid @RequestBody SummaryRequest req) {
        return service.summary(req);
    }

    @PostMapping("/improve")
    public ImproveResponse improve(@Valid @RequestBody ImproveRequest req) {
        return service.improve(req);
    }

    @PostMapping("/tailor")
    public TailorResponse tailor(@Valid @RequestBody TailorRequest req) {
        return service.tailor(req);
    }

    @PostMapping("/translate")
    public CvText translate(@Valid @RequestBody TranslateRequest req) {
        return service.translate(req);
    }
}
