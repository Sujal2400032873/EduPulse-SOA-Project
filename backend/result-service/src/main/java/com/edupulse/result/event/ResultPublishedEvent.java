package com.edupulse.result.event;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record ResultPublishedEvent(
        String eventId,
        String eventType,
        String studentId,
        String subjectCode,
        String subjectName,
        Integer semester,
        BigDecimal marks,
        BigDecimal maxMarks,
        BigDecimal percentage,
        String grade,
        String publishedBy,
        LocalDateTime timestamp
) implements Serializable {

    public static ResultPublishedEvent of(
            String studentId,
            String subjectCode,
            String subjectName,
            Integer semester,
            BigDecimal marks,
            BigDecimal maxMarks,
            BigDecimal percentage,
            String grade,
            String publishedBy) {
        return new ResultPublishedEvent(
                UUID.randomUUID().toString(),
                "ResultPublished",
                studentId,
                subjectCode,
                subjectName,
                semester,
                marks,
                maxMarks,
                percentage,
                grade,
                publishedBy,
                LocalDateTime.now()
        );
    }
}
