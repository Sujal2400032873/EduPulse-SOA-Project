package com.edupulse.result.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
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

import com.edupulse.result.client.StudentServiceClient;
import com.edupulse.result.dto.ResultRequest;
import com.edupulse.result.dto.ResultResponse;
import com.edupulse.result.dto.TranscriptResponse;
import com.edupulse.result.entity.Result;
import com.edupulse.result.exception.BadRequestException;
import com.edupulse.result.exception.DuplicateResourceException;
import com.edupulse.result.exception.ResourceNotFoundException;
import com.edupulse.result.repository.ResultRepository;

@ExtendWith(MockitoExtension.class)
class ResultServiceTest {

    @Mock
    private ResultRepository resultRepository;

    @Mock
    private StudentServiceClient studentServiceClient;

    @Mock
    private com.edupulse.result.event.ResultEventPublisher resultEventPublisher;

    @InjectMocks
    private ResultService resultService;

    private Result sampleResult;
    private ResultRequest sampleRequest;

    @BeforeEach
    void setUp() {
        sampleResult = new Result();
        sampleResult.setId(1L);
        sampleResult.setStudentId("2400032152");
        sampleResult.setSubjectCode("24SDCS03");
        sampleResult.setSubjectName("SOA");
        sampleResult.setSemester(5);
        sampleResult.setCredits(2);
        sampleResult.setMarks(new BigDecimal("92.00"));
        sampleResult.setMaxMarks(new BigDecimal("100.00"));
        sampleResult.setPercentage(new BigDecimal("92.00"));
        sampleResult.setGrade("O");
        sampleResult.setGradePoint(BigDecimal.TEN);
        sampleResult.setRecordedBy("faculty_prof");

        sampleRequest = new ResultRequest();
        sampleRequest.setStudentId("2400032152");
        sampleRequest.setSubjectCode("24SDCS03");
        sampleRequest.setSubjectName("SOA");
        sampleRequest.setSemester(5);
        sampleRequest.setCredits(2);
        sampleRequest.setMarks(new BigDecimal("92.0"));
        sampleRequest.setMaxMarks(new BigDecimal("100.0"));
    }

    @Test
    @DisplayName("Create result succeeds and calculates correct grade and points")
    void testCreateResultSuccess() {
        doNothing().when(studentServiceClient).validateStudentExists("2400032152");
        when(resultRepository.existsByStudentIdAndSubjectCodeAndSemester("2400032152", "24SDCS03", 5)).thenReturn(false);
        when(resultRepository.save(any(Result.class))).thenReturn(sampleResult);

        ResultResponse response = resultService.create(sampleRequest, "faculty_prof");

        assertThat(response).isNotNull();
        assertThat(response.studentId()).isEqualTo("2400032152");
        assertThat(response.subjectCode()).isEqualTo("24SDCS03");
        assertThat(response.grade()).isEqualTo("O");
        assertThat(response.percentage()).isEqualByComparingTo("92.00");
        verify(studentServiceClient).validateStudentExists("2400032152");
        verify(resultRepository).save(any(Result.class));
    }

    @Test
    @DisplayName("Create result throws BadRequestException when marks exceed maxMarks")
    void testCreateResultMarksExceedMax() {
        sampleRequest.setMarks(new BigDecimal("105.0"));
        sampleRequest.setMaxMarks(new BigDecimal("100.0"));

        assertThatThrownBy(() -> resultService.create(sampleRequest, "faculty_prof"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("marks cannot exceed maxMarks");

        verify(resultRepository, never()).save(any());
    }

    @Test
    @DisplayName("Create result fails when student does not exist")
    void testCreateResultStudentNotFound() {
        doThrow(new ResourceNotFoundException("Student with id 'STU9999' not found"))
                .when(studentServiceClient).validateStudentExists("STU9999");

        sampleRequest.setStudentId("STU9999");

        assertThatThrownBy(() -> resultService.create(sampleRequest, "faculty_prof"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("not found");

        verify(resultRepository, never()).save(any());
    }

    @Test
    @DisplayName("Create result throws DuplicateResourceException for duplicate record in same semester")
    void testCreateResultDuplicate() {
        doNothing().when(studentServiceClient).validateStudentExists("2400032152");
        when(resultRepository.existsByStudentIdAndSubjectCodeAndSemester("2400032152", "24SDCS03", 5)).thenReturn(true);

        assertThatThrownBy(() -> resultService.create(sampleRequest, "faculty_prof"))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already exists");

        verify(resultRepository, never()).save(any());
    }

    @Test
    @DisplayName("Get transcript computes CGPA across courses accurately")
    void testGetTranscript() {
        Result r2 = new Result();
        r2.setId(2L);
        r2.setStudentId("2400032152");
        r2.setSubjectCode("24SDCS04");
        r2.setSubjectName("Computer Networks");
        r2.setSemester(5);
        r2.setCredits(2);
        r2.setMarks(new BigDecimal("82.00"));
        r2.setMaxMarks(new BigDecimal("100.00"));
        r2.setPercentage(new BigDecimal("82.00"));
        r2.setGrade("A+");
        r2.setGradePoint(BigDecimal.valueOf(9));

        when(resultRepository.findByStudentIdOrderBySemesterAscSubjectCodeAsc("2400032152"))
                .thenReturn(List.of(sampleResult, r2));

        TranscriptResponse transcript = resultService.getTranscript("2400032152");

        assertThat(transcript).isNotNull();
        assertThat(transcript.studentId()).isEqualTo("2400032152");
        assertThat(transcript.totalSubjects()).isEqualTo(2);
        assertThat(transcript.totalCredits()).isEqualTo(4);
        assertThat(transcript.earnedCredits()).isEqualTo(4);
        assertThat(transcript.cgpa()).isEqualByComparingTo("9.50");
    }

    @Test
    @DisplayName("Get stats returns total results, pass count, and pass rate")
    void testGetStats() {
        when(resultRepository.count()).thenReturn(1L);
        when(resultRepository.findAll()).thenReturn(List.of(sampleResult));

        Map<String, Object> stats = resultService.getStats();

        assertThat(stats.get("totalResults")).isEqualTo(1L);
        assertThat(stats.get("passedCount")).isEqualTo(1L);
        assertThat(stats.get("failedCount")).isEqualTo(0L);
        assertThat(stats.get("passRate")).isEqualTo(100.0);
    }

    @Test
    @DisplayName("Delete result removes existing record")
    void testDeleteResult() {
        when(resultRepository.findById(1L)).thenReturn(Optional.of(sampleResult));

        resultService.delete(1L);

        verify(resultRepository).delete(sampleResult);
    }
}
