package com.edupulse.attendance.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.edupulse.attendance.entity.Attendance;

public record AttendanceResponse(
        Long id,
        String studentId,
        String subject,
        LocalDate date,
        String status,
        String markedBy,
        String lastUpdatedBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static AttendanceResponse from(Attendance a) {
        return new AttendanceResponse(
                a.getId(),
                a.getStudentId(),
                a.getSubject(),
                a.getDate(),
                a.getStatus().name(),
                a.getMarkedBy(),
                a.getLastUpdatedBy(),
                a.getCreatedAt(),
                a.getUpdatedAt()
        );
    }
}