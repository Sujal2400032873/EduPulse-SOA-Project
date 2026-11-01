package com.edupulse.result.controller;

import java.util.List;
import java.util.Map;

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

import com.edupulse.result.dto.ResultRequest;
import com.edupulse.result.dto.ResultResponse;
import com.edupulse.result.dto.TranscriptResponse;
import com.edupulse.result.service.ResultService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/results")
@Tag(name = "Result & Grading Management", description = "Endpoints for academic marks, SGPA/CGPA computation, and transcripts")
public class ResultController {

    private final ResultService resultService;

    public ResultController(ResultService resultService) {
        this.resultService = resultService;
    }

    @PostMapping
    @Operation(summary = "Record academic result", description = "Records marks and automatically calculates grade and grade point. Validates student existence.", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<ResultResponse> create(
            @Valid @RequestBody ResultRequest request,
            Authentication authentication) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        resultService.create(
                                request,
                                authentication.getName()
                        )
                );
    }

    @PostMapping("/batch")
    @Operation(summary = "Batch record results", description = "Record marks for multiple student subjects in a single operation", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<List<ResultResponse>> createBatch(
            @Valid @RequestBody List<ResultRequest> requests,
            Authentication authentication) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        resultService.createBatch(
                                requests,
                                authentication.getName()
                        )
                );
    }

    @GetMapping
    @Operation(summary = "Get all results", description = "List all academic results with optional semester and subject filtering", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<List<ResultResponse>> getAll(
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String subjectCode) {

        return ResponseEntity.ok(
                resultService.getAll(semester, subjectCode)
        );
    }

    @GetMapping("/stats")
    @Operation(summary = "Result statistics", description = "Overall pass rate and performance statistics", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(resultService.getStats());
    }

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Service health indicator")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "RESULT-SERVICE"));
    }

    @GetMapping("/{id:[0-9]+}")
    @Operation(summary = "Get result by ID", description = "Retrieve a single academic result by primary key", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<ResultResponse> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                resultService.getById(id)
        );
    }

    @PutMapping("/{id:[0-9]+}")
    @Operation(summary = "Update academic result", description = "Update marks or course details for an existing result record", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<ResultResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ResultRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                resultService.update(
                        id,
                        request,
                        authentication.getName()
                )
        );
    }

    @DeleteMapping("/{id:[0-9]+}")
    @Operation(summary = "Delete academic result", description = "Admin endpoint to remove an academic record", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        resultService.delete(id);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/student/{studentId}")
    @Operation(summary = "Get student results", description = "Retrieve all academic results for a specific student, optionally filtered by semester", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<List<ResultResponse>> getByStudent(
            @PathVariable String studentId,
            @RequestParam(required = false) Integer semester) {

        return ResponseEntity.ok(
                resultService.getByStudent(
                        studentId,
                        semester
                )
        );
    }

    @GetMapping("/student/{studentId}/transcript")
    @Operation(summary = "Get student transcript", description = "Generates complete academic transcript with semester SGPA and cumulative CGPA", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<TranscriptResponse> getTranscript(
            @PathVariable String studentId) {

        return ResponseEntity.ok(
                resultService.getTranscript(studentId)
        );
    }

    // STUDENT: own results
    @GetMapping("/me")
    @Operation(summary = "Get authenticated student results", description = "Student access to view own academic records", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<List<ResultResponse>> myResults(
            Authentication authentication,
            @RequestParam(required = false) Integer semester) {

        return ResponseEntity.ok(
                resultService.getByStudent(
                        authentication.getName(),
                        semester
                )
        );
    }

    // STUDENT: own transcript
    @GetMapping("/me/transcript")
    @Operation(summary = "Get authenticated student transcript", description = "Student access to view own academic transcript", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<TranscriptResponse> myTranscript(
            Authentication authentication) {

        return ResponseEntity.ok(
                resultService.getTranscript(
                        authentication.getName()
                )
        );
    }
}