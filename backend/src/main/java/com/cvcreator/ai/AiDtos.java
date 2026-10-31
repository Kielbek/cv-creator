package com.cvcreator.ai;

import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Request/response shapes of the AI endpoints. The CV is sent without contact data, dates or the photo: the model
 * only ever sees the text it has to work on, and the frontend merges the answer back by {@code id}.
 */
public final class AiDtos {

    private AiDtos() {
    }

    private static final String LANG = "^[a-z]{2}$";
    private static final String COUNTRY = "^[A-Z]{2}$";

    public record CvText(
            @Size(max = 200) String headline,
            @Size(max = 3000) String summary,
            @Valid @Size(max = 30) List<Experience> experience,
            @Valid @Size(max = 20) List<Education> education,
            @Valid @Size(max = 80) List<Skill> skills,
            @Valid @Size(max = 20) List<Language> languages,
            @Valid @Size(max = 30) List<Project> projects,
            @Valid @Size(max = 30) List<Certificate> certificates,
            @Size(max = 1000) String interests) {
    }

    public record Experience(
            @NotBlank @Size(max = 40) String id,
            @Size(max = 200) String position,
            @Size(max = 200) String company,
            @Size(max = 200) String location,
            @Size(max = 5000) @JsonPropertyDescription("Achievements, one per line") String description) {
    }

    public record Education(
            @NotBlank @Size(max = 40) String id,
            @Size(max = 200) String degree,
            @Size(max = 200) String school,
            @Size(max = 200) String location,
            @Size(max = 2000) String description) {
    }

    public record Skill(@NotBlank @Size(max = 40) String id, @Size(max = 100) String name) {
    }

    public record Language(@NotBlank @Size(max = 40) String id, @Size(max = 100) String name, @Size(max = 100) String level) {
    }

    public record Project(@NotBlank @Size(max = 40) String id, @Size(max = 200) String name, @Size(max = 2000) String description) {
    }

    public record Certificate(@NotBlank @Size(max = 40) String id, @Size(max = 200) String name, @Size(max = 200) String issuer) {
    }

    // ---- summary ----------------------------------------------------------------------------------------------

    public record SummaryRequest(
            @NotBlank @Pattern(regexp = LANG) String language,
            @Pattern(regexp = COUNTRY) String country,
            @Pattern(regexp = "^(professional|confident|friendly|concise)$") String tone,
            @NotNull @Valid CvText cv) {
    }

    public record SummaryResponse(@JsonPropertyDescription("The profile summary, 3-5 sentences, plain text") String summary) {
    }

    // ---- bullet points -----------------------------------------------------------------------------------------

    public record ImproveRequest(
            @NotBlank @Pattern(regexp = LANG) String language,
            @Pattern(regexp = COUNTRY) String country,
            @Size(max = 200) String position,
            @Size(max = 200) String company,
            @NotBlank @Size(max = 5000) String text) {
    }

    public record ImproveResponse(@JsonPropertyDescription("3-6 achievement-oriented bullet points, without bullet characters") List<String> bullets) {
    }

    // ---- tailoring to a job offer -----------------------------------------------------------------------------

    public record TailorRequest(
            @NotBlank @Pattern(regexp = LANG) String language,
            @Pattern(regexp = COUNTRY) String country,
            @NotNull @Valid CvText cv,
            @NotBlank @Size(min = 50, max = 15000) String jobOffer) {
    }

    public record TailorResponse(
            @JsonPropertyDescription("0-100: how well the CV matches the offer as it stands") int matchScore,
            @JsonPropertyDescription("Important keywords/skills of the offer already present in the CV") List<String> matchedKeywords,
            @JsonPropertyDescription("Important keywords/skills of the offer missing from the CV") List<String> missingKeywords,
            @JsonPropertyDescription("Concrete, actionable improvements, most important first, max 6") List<String> suggestions,
            @JsonPropertyDescription("A rewritten profile summary aimed at this offer, using only facts from the CV") String tailoredSummary) {
    }

    // ---- translation ------------------------------------------------------------------------------------------

    public record TranslateRequest(
            @Pattern(regexp = LANG) String sourceLanguage,
            @NotBlank @Pattern(regexp = LANG) String targetLanguage,
            @Pattern(regexp = COUNTRY) String targetCountry,
            @NotNull @Valid CvText cv) {
    }

    public record StatusResponse(boolean enabled) {
    }
}
