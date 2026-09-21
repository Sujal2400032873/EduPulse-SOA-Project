package com.edupulse.student.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.edupulse.student.entity.Student;

public record StudentResponse(
        Long id,
        String studentId,
        String name,
        String email,
        String phone,
        LocalDate dateOfBirth,
        String gender,
        String department,
        Integer year,
        String section,
        Integer admissionYear,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static StudentResponse from(Student s) {
        return new StudentResponse(
                s.getId(),
                s.getStudentId(),
                s.getName(),
                s.getEmail(),
                s.getPhone(),
                s.getDateOfBirth(),
                s.getGender().name(),
                s.getDepartment(),
                s.getYear(),
                s.getSection(),
                s.getAdmissionYear(),
                s.getCreatedAt(),
                s.getUpdatedAt());
    }
}