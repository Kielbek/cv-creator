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
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
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

    /** Reads an existing CV (PDF up to 5 MB) so its content can be moved into a template. */
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AiDtos.ImportedCv importPdf(@RequestParam("file") MultipartFile file) throws IOException {
        byte[] bytes = file.getBytes();
        boolean pdf = bytes.length > 4 && bytes[0] == '%' && bytes[1] == 'P' && bytes[2] == 'D' && bytes[3] == 'F';
        if (!pdf) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Only PDF files are supported");
        }
        return service.importPdf(bytes);
    }

    @PostMapping(value = "/import", consumes = MediaType.APPLICATION_JSON_VALUE)
    public AiDtos.ImportedCv importText(@Valid @RequestBody AiDtos.ImportTextRequest req) {
        return service.importText(req.text());
    }

    @PostMapping("/translate")
    public CvText translate(@Valid @RequestBody TranslateRequest req) {
        return service.translate(req);
    }
}
