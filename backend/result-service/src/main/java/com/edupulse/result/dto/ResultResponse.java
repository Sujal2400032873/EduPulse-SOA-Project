package com.edupulse.result.dto;

import com.edupulse.result.entity.Result;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ResultResponse(
        Long id,
        String studentId,
        String subjectCode,
        String subjectName,
        BigDecimal marks,
        BigDecimal maxMarks,
        BigDecimal percentage,
        String grade,
        BigDecimal gradePoint,
        Integer semester,
        Integer credits,
        String recordedBy,
        String lastUpdatedBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static ResultResponse from(Result result) {
        return new ResultResponse(
                result.getId(),
                result.getStudentId(),
                result.getSubjectCode(),
                result.getSubjectName(),
                result.getMarks(),
                result.getMaxMarks(),
                result.getPercentage(),
                result.getGrade(),
                result.getGradePoint(),
                result.getSemester(),
                result.getCredits(),
                result.getRecordedBy(),
                result.getLastUpdatedBy(),
                result.getCreatedAt(),
                result.getUpdatedAt()
        );
    }
}