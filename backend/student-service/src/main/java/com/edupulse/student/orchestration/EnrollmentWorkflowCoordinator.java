package com.edupulse.student.orchestration;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.edupulse.student.dto.StudentRequest;
import com.edupulse.student.dto.StudentResponse;
import com.edupulse.student.entity.Student;
import com.edupulse.student.repository.StudentRepository;
import com.edupulse.student.service.StudentService;

@Component
public class EnrollmentWorkflowCoordinator {

    private static final Logger log = LoggerFactory.getLogger(EnrollmentWorkflowCoordinator.class);

    private final StudentService studentService;
    private final StudentRepository studentRepository;

    public EnrollmentWorkflowCoordinator(
            StudentService studentService,
            StudentRepository studentRepository) {
        this.studentService = studentService;
        this.studentRepository = studentRepository;
    }

    public Map<String, Object> executeEnrollmentWorkflow(StudentRequest request, boolean simulateEligibilityFailure) {
        log.info("[ORCHESTRATION] Starting Student Enrollment Workflow for studentId={}", request.studentId());

        StudentResponse createdStudent = null;
        try {
            // STEP 1: Execute Student Profile Creation
            log.info("[ORCHESTRATION STEP 1] Creating student profile...");
            createdStudent = studentService.create(request);
            log.info("[ORCHESTRATION STEP 1 SUCCESS] Profile created with id={}", createdStudent.id());

            // STEP 2: Initialize Attendance Eligibility & Academic Roster
            log.info("[ORCHESTRATION STEP 2] Initializing attendance eligibility and course roster...");
            if (simulateEligibilityFailure) {
                throw new IllegalStateException("Simulated Downstream Failure: Attendance roster service unreachable");
            }
            log.info("[ORCHESTRATION STEP 2 SUCCESS] Attendance eligibility initialized successfully.");

            return Map.of(
                    "status", "COMPLETED",
                    "studentId", createdStudent.studentId(),
                    "workflow", "STUDENT_ENROLLMENT_AND_ELIGIBILITY",
                    "step1_profile", "SUCCESS",
                    "step2_eligibility", "SUCCESS"
            );

        } catch (Exception e) {
            log.error("[ORCHESTRATION FAILURE] Workflow error at Step 2: {}. Triggering compensating transaction...", e.getMessage());

            // STEP 3: COMPENSATION TRANSACTION
            executeCompensation(request.studentId());

            return Map.of(
                    "status", "COMPENSATED",
                    "studentId", request.studentId(),
                    "workflow", "STUDENT_ENROLLMENT_AND_ELIGIBILITY",
                    "error", e.getMessage(),
                    "compensation", "SUCCESS_STUDENT_ENROLLMENT_ROLLED_BACK"
            );
        }
    }

    private void executeCompensation(String studentId) {
        try {
            log.warn("[COMPENSATION] Rolling back enrollment for studentId={}", studentId);
            studentRepository.findByStudentId(studentId).ifPresent(student -> {
                studentRepository.delete(student);
                log.info("[COMPENSATION COMPLETED] Student record {} deleted to restore state consistency.", studentId);
            });
        } catch (Exception ce) {
            log.error("[COMPENSATION ERROR] Failed to compensate student {}: {}", studentId, ce.getMessage());
        }
    }
}
