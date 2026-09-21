package com.edupulse.student.dto;

import java.time.LocalDate;

import com.edupulse.student.entity.Gender;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record StudentRequest(

        @NotBlank(message = "studentId is required")
        @Size(min = 3, max = 20, message = "studentId must be 3 to 20 characters")
        @Pattern(regexp = "^[A-Za-z0-9]+$", message = "studentId may contain only letters and digits")
        String studentId,

        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name must be at most 100 characters")
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        @Size(max = 100, message = "Email must be at most 100 characters")
        String email,

        @Pattern(regexp = "^[+]?[0-9]{10,15}$",
                message = "Phone must be 10 to 15 digits (optional leading +)")
        String phone,

        @NotNull(message = "dateOfBirth is required (format yyyy-MM-dd)")
        @Past(message = "dateOfBirth must be in the past")
        LocalDate dateOfBirth,

        @NotNull(message = "gender is required (MALE, FEMALE or OTHER)")
        Gender gender,

        @NotBlank(message = "Department is required")
        @Size(max = 100, message = "Department must be at most 100 characters")
        String department,

        @NotNull(message = "year is required")
        @Min(value = 1, message = "year must be at least 1")
        @Max(value = 6, message = "year must be at most 6")
        Integer year,

        @Size(max = 10, message = "Section must be at most 10 characters")
        String section,

        @NotNull(message = "admissionYear is required")
        @Min(value = 2000, message = "admissionYear must be 2000 or later")
        @Max(value = 2100, message = "admissionYear must be 2100 or earlier")
        Integer admissionYear
) {}