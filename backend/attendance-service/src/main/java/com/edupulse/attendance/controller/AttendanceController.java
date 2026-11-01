package com.edupulse.attendance.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.edupulse.attendance.dto.AttendancePercentageResponse;
import com.edupulse.attendance.dto.AttendanceRequest;
import com.edupulse.attendance.dto.AttendanceResponse;
import com.edupulse.attendance.service.AttendanceService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/attendance")
@Tag(name = "Attendance Management", description = "Endpoints for student attendance tracking, calculations, and summaries")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping
    @Operation(summary = "Mark student attendance", description = "Records attendance for an enrolled student. Requires student existence validation.", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<AttendanceResponse> mark(
            @Valid @RequestBody AttendanceRequest request,
            Authentication authentication) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        attendanceService.mark(
                                request,
                                authentication.getName()));
    }

    @PostMapping("/batch")
    @Operation(summary = "Record batch attendance", description = "Records multiple attendance entries in a single request", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<List<AttendanceResponse>> markBatch(
            @Valid @RequestBody List<AttendanceRequest> requests,
            Authentication authentication) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        attendanceService.markBatch(
                                requests,
                                authentication.getName()));
    }

    @GetMapping
    @Operation(summary = "Get all attendance records", description = "List attendance entries with optional studentId, subject, and date filters", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<List<AttendanceResponse>> getAll(
            @RequestParam(required = false) String studentId,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return ResponseEntity.ok(
                attendanceService.getAll(studentId, subject, date));
    }

    @GetMapping("/stats")
    @Operation(summary = "Attendance statistics", description = "Aggregate statistics across all attendance records", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(attendanceService.getStats());
    }

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Service health indicator")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "ATTENDANCE-SERVICE"));
    }

    @GetMapping("/date/{date}")
    @Operation(summary = "Get attendance by date", description = "Fetch all attendance records for a specific calendar date", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<List<AttendanceResponse>> getByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return ResponseEntity.ok(
                attendanceService.getByDate(date));
    }

    @GetMapping("/student/{studentId}")
    @Operation(summary = "Get attendance by student ID", description = "Retrieve attendance logs for a specific student", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<List<AttendanceResponse>> getByStudent(
            @PathVariable String studentId,
            @RequestParam(required = false) String subject) {

        return ResponseEntity.ok(
                attendanceService.getByStudent(
                        studentId,
                        subject));
    }

    @GetMapping("/student/{studentId}/percentage")
    @Operation(summary = "Get attendance percentage", description = "Calculates total and subject-wise attendance percentages for a student", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<AttendancePercentageResponse> getPercentage(
            @PathVariable String studentId) {

        return ResponseEntity.ok(
                attendanceService.getPercentage(studentId));
    }

    @GetMapping("/me")
    @Operation(summary = "Get authenticated student's attendance", description = "Student access to view own attendance records", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<List<AttendanceResponse>> myAttendance(
            Authentication authentication,
            @RequestParam(required = false) String subject) {

        return ResponseEntity.ok(
                attendanceService.getByStudent(
                        authentication.getName(),
                        subject));
    }

    @GetMapping("/me/percentage")
    @Operation(summary = "Get authenticated student's attendance percentage", description = "Student access to view own attendance summary", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<AttendancePercentageResponse> myPercentage(
            Authentication authentication) {

        return ResponseEntity.ok(
                attendanceService.getPercentage(
                        authentication.getName()));
    }

    @GetMapping("/{id:[0-9]+}")
    @Operation(summary = "Get attendance by record ID", description = "Retrieve a single attendance record by primary key", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<AttendanceResponse> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                attendanceService.getById(id));
    }

    @PutMapping("/{id:[0-9]+}")
    @Operation(summary = "Update attendance record", description = "Update status, subject, or date of an existing record", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<AttendanceResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AttendanceRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                attendanceService.update(
                        id,
                        request,
                        authentication.getName()));
    }

    @DeleteMapping("/{id:[0-9]+}")
    @Operation(summary = "Delete attendance record", description = "Remove an attendance entry", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        attendanceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}