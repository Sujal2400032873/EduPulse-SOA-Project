package com.edupulse.attendance.dto;

import java.time.LocalDate;

import com.edupulse.attendance.entity.AttendanceStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AttendanceRequest(

        @NotBlank(message = "studentId is required")
        @Size(min = 3, max = 20, message = "studentId must be 3 to 20 characters")
        @Pattern(
                regexp = "^[A-Za-z0-9]+$",
                message = "studentId may contain only letters and digits"
        )
        String studentId,

        @NotBlank(message = "Subject is required")
        @Size(max = 100, message = "Subject must be at most 100 characters")
        String subject,

        @NotNull(message = "date is required (format yyyy-MM-dd)")
        @PastOrPresent(message = "date cannot be in the future")
        LocalDate date,

        @NotNull(message = "status is required (PRESENT or ABSENT)")
        AttendanceStatus status

) {}