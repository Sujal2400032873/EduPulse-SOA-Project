package com.edupulse.attendance.dto;

public record SubjectAttendanceResponse(
        String subject,
        long totalClasses,
        long presentClasses,
        long absentClasses,
        double percentage
) {}