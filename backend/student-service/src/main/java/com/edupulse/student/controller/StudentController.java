package com.edupulse.student.controller;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
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

import com.edupulse.student.dto.StudentRequest;
import com.edupulse.student.dto.StudentResponse;
import com.edupulse.student.service.StudentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/students")
@Tag(name = "Student Management", description = "CRUD and query operations for Student profiles")
public class StudentController {

    private final StudentService studentService;
    private final com.edupulse.student.orchestration.EnrollmentWorkflowCoordinator workflowCoordinator;
    @Value("${server.port:8082}")
private String serverPort;

    public StudentController(
            StudentService studentService,
            com.edupulse.student.orchestration.EnrollmentWorkflowCoordinator workflowCoordinator) {
        this.studentService = studentService;
        this.workflowCoordinator = workflowCoordinator;
    }

    @PostMapping
    @Operation(summary = "Create student", description = "Admin endpoint to enrol new student", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<StudentResponse> create(
            @Valid @RequestBody StudentRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(studentService.create(request));
    }

    @PostMapping("/orchestration/enroll")
    @Operation(summary = "Orchestrated enrollment workflow", description = "Executes multi-step enrollment with compensation on failure", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<Map<String, Object>> orchestratedEnroll(
            @Valid @RequestBody StudentRequest request,
            @RequestParam(defaultValue = "false") boolean simulateFailure) {
        return ResponseEntity.ok(workflowCoordinator.executeEnrollmentWorkflow(request, simulateFailure));
    }

    @GetMapping
    @Operation(summary = "List students", description = "Query all students with optional search keyword or department filter", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<List<StudentResponse>> getAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String department) {

        return ResponseEntity.ok(
                studentService.getAll(keyword, department));
    }

    @GetMapping("/me")
    @Operation(summary = "Get own profile", description = "Allows an authenticated student to retrieve their own record", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<StudentResponse> me(
            Authentication authentication) {

        return ResponseEntity.ok(
                studentService.getMyProfile(
                        authentication.getName()));
    }

    @PutMapping("/me")
    @Operation(summary = "Update own profile", description = "Allows an authenticated student to update their demographic record", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<StudentResponse> updateMe(
            Authentication authentication,
            @Valid @RequestBody StudentRequest request) {

        return ResponseEntity.ok(
                studentService.updateMyProfile(
                        authentication.getName(), request));
    }

    @GetMapping("/stats")
    @Operation(summary = "Student statistics", description = "Summary statistics for administration dashboard", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(studentService.getStats());
    }

    @GetMapping("/health")
public ResponseEntity<Map<String, String>> health() {
    return ResponseEntity.ok(Map.of(
        "status", "UP",
        "service", "STUDENT-SERVICE",
        "instance", serverPort
    ));
}


    @GetMapping("/student-id/{studentId}")
    @Operation(summary = "Get by student ID", description = "Retrieve student record by institutional student ID (e.g. S101)", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<StudentResponse> getByStudentId(
            @PathVariable String studentId) {

        return ResponseEntity.ok(
                studentService.getByStudentId(studentId));
    }

    @GetMapping("/{studentId}/exists")
    @Operation(summary = "Check student exists", description = "Validation endpoint for downstream services (Attendance, Result)", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<Map<String, Object>> checkExists(
            @PathVariable String studentId) {

        boolean exists = studentService.existsByStudentId(studentId);
        if (!exists) {
            try {
                Long id = Long.parseLong(studentId);
                studentService.getById(id);
                exists = true;
            } catch (Exception ignored) {
                exists = false;
            }
        }
        return ResponseEntity.ok(Map.of("exists", exists, "studentId", studentId));
    }

    @GetMapping("/{id:[0-9]+}")
    @Operation(summary = "Get student by DB ID", description = "Retrieve student by primary key ID", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<StudentResponse> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                studentService.getById(id));
    }

    @PutMapping("/{id:[0-9]+}")
    @Operation(summary = "Update student", description = "Admin endpoint to update student information", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<StudentResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody StudentRequest request) {

        return ResponseEntity.ok(
                studentService.update(id, request));
    }

    @DeleteMapping("/{id:[0-9]+}")
    @Operation(summary = "Delete student", description = "Admin endpoint to remove student record", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        studentService.delete(id);

        return ResponseEntity.noContent().build();
    }
}