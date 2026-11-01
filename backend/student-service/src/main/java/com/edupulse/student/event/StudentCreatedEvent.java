package com.edupulse.student.event;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

public record StudentCreatedEvent(
        String eventId,
        String studentId,
        String name,
        String email,
        String department,
        Integer year,
        Instant timestamp
) implements Serializable {

    public static StudentCreatedEvent of(String studentId, String name, String email, String department, Integer year) {
        return new StudentCreatedEvent(
                UUID.randomUUID().toString(),
                studentId,
                name,
                email,
                department,
                year,
                Instant.now()
        );
    }
}
