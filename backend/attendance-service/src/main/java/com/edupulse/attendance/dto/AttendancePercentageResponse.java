package com.edupulse.attendance.dto;

import java.util.List;

public record AttendancePercentageResponse(
        String studentId,
        long totalClasses,
        long presentClasses,
        long absentClasses,
        double percentage,
        List<SubjectAttendanceResponse> subjectWise
) {}