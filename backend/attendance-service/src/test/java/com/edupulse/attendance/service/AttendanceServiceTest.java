package com.edupulse.attendance.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
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

import com.edupulse.attendance.client.StudentServiceClient;
import com.edupulse.attendance.dto.AttendancePercentageResponse;
import com.edupulse.attendance.dto.AttendanceRequest;
import com.edupulse.attendance.dto.AttendanceResponse;
import com.edupulse.attendance.entity.Attendance;
import com.edupulse.attendance.entity.AttendanceStatus;
import com.edupulse.attendance.exception.DuplicateResourceException;
import com.edupulse.attendance.exception.ResourceNotFoundException;
import com.edupulse.attendance.repository.AttendanceRepository;
import com.edupulse.attendance.repository.SubjectSummary;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private StudentServiceClient studentServiceClient;

    @Mock
    private com.edupulse.attendance.event.AttendanceEventPublisher attendanceEventPublisher;

    @InjectMocks
    private AttendanceService attendanceService;

    private Attendance sampleAttendance;
    private AttendanceRequest sampleRequest;

    @BeforeEach
    void setUp() {
        sampleAttendance = new Attendance();
        sampleAttendance.setId(1L);
        sampleAttendance.setStudentId("STU1001");
        sampleAttendance.setSubject("DISTRIBUTED SYSTEMS");
        sampleAttendance.setDate(LocalDate.of(2026, 10, 18));
        sampleAttendance.setStatus(AttendanceStatus.PRESENT);
        sampleAttendance.setMarkedBy("admin");

        sampleRequest = new AttendanceRequest(
                "STU1001",
                "Distributed Systems",
                LocalDate.of(2026, 10, 18),
                AttendanceStatus.PRESENT
        );
    }

    @Test
    @DisplayName("Mark attendance succeeds for valid existing student")
    void testMarkAttendanceSuccess() {
        doNothing().when(studentServiceClient).validateStudentExists("STU1001");
        when(attendanceRepository.existsByStudentIdAndSubjectAndDate("STU1001", "DISTRIBUTED SYSTEMS", LocalDate.of(2026, 10, 18)))
                .thenReturn(false);
        when(attendanceRepository.save(any(Attendance.class))).thenReturn(sampleAttendance);

        AttendanceResponse response = attendanceService.mark(sampleRequest, "admin");

        assertThat(response).isNotNull();
        assertThat(response.studentId()).isEqualTo("STU1001");
        assertThat(response.status()).isEqualTo("PRESENT");
        verify(studentServiceClient).validateStudentExists("STU1001");
        verify(attendanceRepository).save(any(Attendance.class));
    }

    @Test
    @DisplayName("Mark attendance fails when Student Service reports student not found")
    void testMarkAttendanceStudentNotFound() {
        doThrow(new ResourceNotFoundException("Student with id 'STU9999' not found"))
                .when(studentServiceClient).validateStudentExists("STU9999");

        AttendanceRequest badRequest = new AttendanceRequest(
                "STU9999",
                "Distributed Systems",
                LocalDate.of(2026, 10, 18),
                AttendanceStatus.PRESENT
        );

        assertThatThrownBy(() -> attendanceService.mark(badRequest, "admin"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("not found");

        verify(attendanceRepository, never()).save(any());
    }

    @Test
    @DisplayName("Mark attendance rejects duplicate record on same date and subject")
    void testMarkAttendanceDuplicate() {
        doNothing().when(studentServiceClient).validateStudentExists("STU1001");
        when(attendanceRepository.existsByStudentIdAndSubjectAndDate("STU1001", "DISTRIBUTED SYSTEMS", LocalDate.of(2026, 10, 18)))
                .thenReturn(true);

        assertThatThrownBy(() -> attendanceService.mark(sampleRequest, "admin"))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already exists");

        verify(attendanceRepository, never()).save(any());
    }

    @Test
    @DisplayName("Get percentage returns calculated summary")
    void testGetPercentage() {
        SubjectSummary summaryRow = new SubjectSummary() {
            @Override
            public String getSubject() {
                return "DISTRIBUTED SYSTEMS";
            }

            @Override
            public Number getTotal() {
                return 10L;
            }

            @Override
            public Number getPresent() {
                return 8L;
            }
        };

        when(attendanceRepository.summarizeBySubject("STU1001", AttendanceStatus.PRESENT))
                .thenReturn(List.of(summaryRow));

        AttendancePercentageResponse summary = attendanceService.getPercentage("STU1001");

        assertThat(summary).isNotNull();
        assertThat(summary.totalClasses()).isEqualTo(10L);
        assertThat(summary.presentClasses()).isEqualTo(8L);
        assertThat(summary.absentClasses()).isEqualTo(2L);
        assertThat(summary.percentage()).isEqualTo(80.0);
    }

    @Test
    @DisplayName("Get stats returns overall statistics")
    void testGetStats() {
        when(attendanceRepository.count()).thenReturn(1L);
        when(attendanceRepository.findAll()).thenReturn(List.of(sampleAttendance));

        Map<String, Object> stats = attendanceService.getStats();

        assertThat(stats.get("totalRecords")).isEqualTo(1L);
        assertThat(stats.get("presentCount")).isEqualTo(1L);
        assertThat(stats.get("absentCount")).isEqualTo(0L);
        assertThat(stats.get("overallPercentage")).isEqualTo(100.0);
    }

    @Test
    @DisplayName("Delete attendance removes record")
    void testDeleteAttendance() {
        when(attendanceRepository.findById(1L)).thenReturn(Optional.of(sampleAttendance));

        attendanceService.delete(1L);

        verify(attendanceRepository).delete(sampleAttendance);
    }
}
