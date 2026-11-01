package com.edupulse.student.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.edupulse.student.dto.StudentRequest;
import com.edupulse.student.dto.StudentResponse;
import com.edupulse.student.entity.Gender;
import com.edupulse.student.entity.Student;
import com.edupulse.student.exception.DuplicateResourceException;
import com.edupulse.student.exception.ResourceNotFoundException;
import com.edupulse.student.repository.StudentRepository;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private StudentService studentService;

    private Student sampleStudent;
    private StudentRequest sampleRequest;

    @BeforeEach
    void setUp() {
        sampleStudent = new Student();
        sampleStudent.setId(1L);
        sampleStudent.setStudentId("STU1001");
        sampleStudent.setName("Aarav Sharma");
        sampleStudent.setEmail("aarav@edupulse.edu");
        sampleStudent.setDepartment("Computer Science");
        sampleStudent.setYear(2);
        sampleStudent.setAdmissionYear(2024);
        sampleStudent.setSection("A");
        sampleStudent.setGender(Gender.MALE);
        sampleStudent.setDateOfBirth(LocalDate.of(2004, 5, 15));

        sampleRequest = new StudentRequest(
                "STU1001",
                "Aarav Sharma",
                "aarav@edupulse.edu",
                "9876543210",
                LocalDate.of(2004, 5, 15),
                Gender.MALE,
                "Computer Science",
                2,
                "A",
                2024
        );
    }

    @Test
    @DisplayName("Create student successfully when studentId and email are unique")
    void testCreateStudentSuccess() {
        when(studentRepository.existsByStudentId("STU1001")).thenReturn(false);
        when(studentRepository.existsByEmail("aarav@edupulse.edu")).thenReturn(false);
        when(studentRepository.save(any(Student.class))).thenReturn(sampleStudent);

        StudentResponse response = studentService.create(sampleRequest);

        assertThat(response).isNotNull();
        assertThat(response.studentId()).isEqualTo("STU1001");
        assertThat(response.name()).isEqualTo("Aarav Sharma");
        verify(studentRepository).save(any(Student.class));
    }

    @Test
    @DisplayName("Create student throws DuplicateResourceException if studentId already exists")
    void testCreateStudentDuplicateId() {
        when(studentRepository.existsByStudentId("STU1001")).thenReturn(true);

        assertThatThrownBy(() -> studentService.create(sampleRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("studentId 'STU1001' already exists");

        verify(studentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Create student throws DuplicateResourceException if email already exists")
    void testCreateStudentDuplicateEmail() {
        when(studentRepository.existsByStudentId("STU1001")).thenReturn(false);
        when(studentRepository.existsByEmail("aarav@edupulse.edu")).thenReturn(true);

        assertThatThrownBy(() -> studentService.create(sampleRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Email 'aarav@edupulse.edu' already exists");

        verify(studentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Get student by studentId returns profile")
    void testGetByStudentId() {
        when(studentRepository.findByStudentId("STU1001")).thenReturn(Optional.of(sampleStudent));

        StudentResponse response = studentService.getByStudentId("STU1001");

        assertThat(response).isNotNull();
        assertThat(response.studentId()).isEqualTo("STU1001");
        assertThat(response.department()).isEqualTo("Computer Science");
    }

    @Test
    @DisplayName("Get student by non-existent studentId throws ResourceNotFoundException")
    void testGetByStudentIdNotFound() {
        when(studentRepository.findByStudentId("UNKNOWN")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> studentService.getByStudentId("UNKNOWN"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("not found");
    }

    @Test
    @DisplayName("existsByStudentId returns true for existing student and false for unknown")
    void testExistsByStudentId() {
        when(studentRepository.existsByStudentId("STU1001")).thenReturn(true);
        when(studentRepository.existsByStudentId("STU9999")).thenReturn(false);

        assertThat(studentService.existsByStudentId("STU1001")).isTrue();
        assertThat(studentService.existsByStudentId("STU9999")).isFalse();
    }

    @Test
    @DisplayName("Get stats returns correct student count and department count")
    void testGetStats() {
        when(studentRepository.count()).thenReturn(1L);
        when(studentRepository.findAll()).thenReturn(List.of(sampleStudent));

        Map<String, Object> stats = studentService.getStats();

        assertThat(stats.get("totalStudents")).isEqualTo(1L);
        assertThat(stats.get("totalDepartments")).isEqualTo(1L);
    }

    @Test
    @DisplayName("Delete student calls repository delete")
    void testDeleteStudent() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(sampleStudent));

        studentService.delete(1L);

        verify(studentRepository).delete(sampleStudent);
    }
}
