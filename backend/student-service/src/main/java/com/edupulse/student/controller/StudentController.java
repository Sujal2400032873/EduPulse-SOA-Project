package com.edupulse.student.controller;

import java.util.List;

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

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping
    public ResponseEntity<StudentResponse> create(
            @Valid @RequestBody StudentRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(studentService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<StudentResponse>> getAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String department) {

        return ResponseEntity.ok(
                studentService.getAll(keyword, department));
    }

    @GetMapping("/me")
    public ResponseEntity<StudentResponse> me(
            Authentication authentication) {

        return ResponseEntity.ok(
                studentService.getMyProfile(
                        authentication.getName()));
    }

    @GetMapping("/student-id/{studentId}")
    public ResponseEntity<StudentResponse> getByStudentId(
            @PathVariable String studentId) {

        return ResponseEntity.ok(
                studentService.getByStudentId(studentId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentResponse> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                studentService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody StudentRequest request) {

        return ResponseEntity.ok(
                studentService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        studentService.delete(id);

        return ResponseEntity.noContent().build();
    }
}