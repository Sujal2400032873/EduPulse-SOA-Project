package com.edupulse.result.dto;

import java.math.BigDecimal;
import java.util.List;

public record TranscriptResponse(
        String studentId,
        List<SemesterTranscript> semesters,
        Integer totalSubjects,
        Integer failedSubjects,
        Integer totalCredits,
        Integer earnedCredits,
        BigDecimal cgpa
) {
}