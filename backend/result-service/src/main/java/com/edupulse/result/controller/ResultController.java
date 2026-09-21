package com.edupulse.result.controller;

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

import com.edupulse.result.dto.ResultRequest;
import com.edupulse.result.dto.ResultResponse;
import com.edupulse.result.dto.TranscriptResponse;
import com.edupulse.result.service.ResultService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/results")
public class ResultController {

    private final ResultService resultService;

    public ResultController(ResultService resultService) {
        this.resultService = resultService;
    }

    @PostMapping("/{id}")
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

    @PutMapping("/{id}")
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        resultService.delete(id);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/student/{studentId}")
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
    public ResponseEntity<TranscriptResponse> getTranscript(
            @PathVariable String studentId) {

        return ResponseEntity.ok(
                resultService.getTranscript(studentId)
        );
    }

    // STUDENT: own results
    @GetMapping("/me")
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
    public ResponseEntity<TranscriptResponse> myTranscript(
            Authentication authentication) {

        return ResponseEntity.ok(
                resultService.getTranscript(
                        authentication.getName()
                )
        );
    }
}