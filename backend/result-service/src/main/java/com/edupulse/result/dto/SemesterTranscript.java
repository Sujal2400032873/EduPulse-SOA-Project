package com.edupulse.result.dto;

import java.math.BigDecimal;
import java.util.List;

public record SemesterTranscript(
        Integer semester,
        List<ResultResponse> subjects,
        Integer totalCredits,
        Integer earnedCredits,
        BigDecimal sgpa
) {
}