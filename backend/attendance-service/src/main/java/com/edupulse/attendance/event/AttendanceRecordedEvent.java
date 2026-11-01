package com.edupulse.attendance.event;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record AttendanceRecordedEvent(
        String eventId,
        String eventType,
        String studentId,
        String subject,
        LocalDate date,
        String status,
        String markedBy,
        LocalDateTime timestamp
) implements Serializable {

    public static AttendanceRecordedEvent of(
            String studentId,
            String subject,
            LocalDate date,
            String status,
            String markedBy) {
        return new AttendanceRecordedEvent(
                UUID.randomUUID().toString(),
                "AttendanceRecorded",
                studentId,
                subject,
                date,
                status,
                markedBy,
                LocalDateTime.now()
        );
    }
}
