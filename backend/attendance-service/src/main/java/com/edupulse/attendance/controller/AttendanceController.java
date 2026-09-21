package com.edupulse.attendance.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping
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

    @PutMapping("/{id}")
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

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AttendanceResponse>> getByStudent(
            @PathVariable String studentId,
            @RequestParam(required = false) String subject) {

        return ResponseEntity.ok(
                attendanceService.getByStudent(
                        studentId,
                        subject));
    }

    @GetMapping("/student/{studentId}/percentage")
    public ResponseEntity<AttendancePercentageResponse> getPercentage(
            @PathVariable String studentId) {

        return ResponseEntity.ok(
                attendanceService.getPercentage(studentId));
    }

    @GetMapping("/me")
    public ResponseEntity<List<AttendanceResponse>> myAttendance(
            Authentication authentication,
            @RequestParam(required = false) String subject) {

        return ResponseEntity.ok(
                attendanceService.getByStudent(
                        authentication.getName(),
                        subject));
    }

    @GetMapping("/me/percentage")
    public ResponseEntity<AttendancePercentageResponse> myPercentage(
            Authentication authentication) {

        return ResponseEntity.ok(
                attendanceService.getPercentage(
                        authentication.getName()));
    }
}