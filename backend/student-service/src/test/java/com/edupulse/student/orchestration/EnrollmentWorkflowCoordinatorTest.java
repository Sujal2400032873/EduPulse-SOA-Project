package com.edupulse.student.orchestration;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.edupulse.student.dto.StudentRequest;
import com.edupulse.student.dto.StudentResponse;
import com.edupulse.student.entity.Gender;
import com.edupulse.student.entity.Student;
import com.edupulse.student.repository.StudentRepository;
import com.edupulse.student.service.StudentService;

@ExtendWith(MockitoExtension.class)
class EnrollmentWorkflowCoordinatorTest {

    @Mock
    private StudentService studentService;

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private EnrollmentWorkflowCoordinator coordinator;

    private StudentRequest request;
    private StudentResponse response;

    @BeforeEach
    void setUp() {
        request = new StudentRequest(
                "STU2001",
                "Vikram Rathore",
                "vikram.rathore@edupulse.edu",
                "+919876543210",
                LocalDate.of(2004, 5, 12),
                Gender.MALE,
                "Computer Science",
                1,
                "A",
                2025
        );

        response = new StudentResponse(
                1L,
                "STU2001",
                "Vikram Rathore",
                "vikram.rathore@edupulse.edu",
                "+919876543210",
                LocalDate.of(2004, 5, 12),
                "MALE",
                "Computer Science",
                1,
                "A",
                2025,
                LocalDateTime.now(),
                LocalDateTime.now()
        );
    }

    @Test
    @DisplayName("Should successfully coordinate multi-step enrollment workflow")
    void shouldExecuteEnrollmentWorkflowSuccessfully() {
        when(studentService.create(any(StudentRequest.class))).thenReturn(response);

        Map<String, Object> result = coordinator.executeEnrollmentWorkflow(request, false);

        assertThat(result).isNotNull();
        assertThat(result.get("status")).isEqualTo("COMPLETED");
        assertThat(result.get("studentId")).isEqualTo("STU2001");
        assertThat(result.get("step1_profile")).isEqualTo("SUCCESS");
        assertThat(result.get("step2_eligibility")).isEqualTo("SUCCESS");
        verify(studentService, times(1)).create(any(StudentRequest.class));
    }

    @Test
    @DisplayName("Should execute compensating transaction when step 2 fails")
    void shouldRollbackWhenWorkflowStepFails() {
        when(studentService.create(any(StudentRequest.class))).thenReturn(response);
        Student dummy = new Student();
        dummy.setStudentId("STU2001");
        when(studentRepository.findByStudentId("STU2001")).thenReturn(Optional.of(dummy));

        Map<String, Object> result = coordinator.executeEnrollmentWorkflow(request, true);

        assertThat(result).isNotNull();
        assertThat(result.get("status")).isEqualTo("COMPENSATED");
        assertThat(result.get("compensation")).isEqualTo("SUCCESS_STUDENT_ENROLLMENT_ROLLED_BACK");
        verify(studentRepository, times(1)).delete(dummy);
    }
}
