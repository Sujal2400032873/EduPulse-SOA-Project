package com.edupulse.result.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.edupulse.result.client.StudentServiceClient;
import com.edupulse.result.dto.ResultRequest;
import com.edupulse.result.dto.ResultResponse;
import com.edupulse.result.dto.SemesterTranscript;
import com.edupulse.result.dto.TranscriptResponse;
import com.edupulse.result.entity.Result;
import com.edupulse.result.exception.BadRequestException;
import com.edupulse.result.exception.DuplicateResourceException;
import com.edupulse.result.exception.ResourceNotFoundException;
import com.edupulse.result.repository.ResultRepository;

@Service
public class ResultService {

    private final ResultRepository resultRepository;
    private final StudentServiceClient studentServiceClient;
    private final com.edupulse.result.event.ResultEventPublisher resultEventPublisher;

    public ResultService(
            ResultRepository resultRepository,
            StudentServiceClient studentServiceClient,
            com.edupulse.result.event.ResultEventPublisher resultEventPublisher) {
        this.resultRepository = resultRepository;
        this.studentServiceClient = studentServiceClient;
        this.resultEventPublisher = resultEventPublisher;
    }

    @Transactional
    public ResultResponse create(ResultRequest request, String recordedBy) {

        validateMarks(request);

        String studentId = request.getStudentId().trim();
        String subjectCode = normalizeCode(request.getSubjectCode());

        // Inter-service verification: confirm student exists in Student Service
        studentServiceClient.validateStudentExists(studentId);

        if (resultRepository.existsByStudentIdAndSubjectCodeAndSemester(
                studentId,
                subjectCode,
                request.getSemester())) {

            throw duplicate(
                    studentId,
                    subjectCode,
                    request.getSemester()
            );
        }

        Result result = new Result();

        result.setRecordedBy(recordedBy);

        applyRequest(result, request);

        Result saved = resultRepository.save(result);

        if (resultEventPublisher != null) {
            resultEventPublisher.publishResultPublished(
                    com.edupulse.result.event.ResultPublishedEvent.of(
                            saved.getStudentId(),
                            saved.getSubjectCode(),
                            saved.getSubjectName(),
                            saved.getSemester(),
                            saved.getMarks(),
                            saved.getMaxMarks(),
                            saved.getPercentage(),
                            saved.getGrade(),
                            saved.getRecordedBy()
                    )
            );
        }

        return ResultResponse.from(saved);
    }

    @Transactional
    public List<ResultResponse> createBatch(
            List<ResultRequest> requests,
            String recordedBy) {

        List<ResultResponse> responses = new ArrayList<>();
        for (ResultRequest req : requests) {
            responses.add(create(req, recordedBy));
        }
        return responses;
    }

    @Transactional
    public ResultResponse update(
            Long id,
            ResultRequest request,
            String updatedBy) {

        validateMarks(request);

        Result result = resultRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Result with id " + id + " not found"
                        )
                );

        String studentId = request.getStudentId().trim();
        String subjectCode = normalizeCode(request.getSubjectCode());

        // Inter-service verification: confirm student exists in Student Service
        studentServiceClient.validateStudentExists(studentId);

        if (resultRepository
                .existsByStudentIdAndSubjectCodeAndSemesterAndIdNot(
                        studentId,
                        subjectCode,
                        request.getSemester(),
                        id)) {

            throw duplicate(
                    studentId,
                    subjectCode,
                    request.getSemester()
            );
        }

        applyRequest(result, request);

        result.setLastUpdatedBy(updatedBy);

        return ResultResponse.from(
                resultRepository.save(result)
        );
    }

    @Transactional
    public void delete(Long id) {

        Result result = resultRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Result with id " + id + " not found"
                        )
                );

        resultRepository.delete(result);
    }

    @Transactional(readOnly = true)
    public ResultResponse getById(Long id) {
        Result result = resultRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Result with id " + id + " not found"
                        )
                );
        return ResultResponse.from(result);
    }

    @Transactional(readOnly = true)
    public List<ResultResponse> getAll(
            Integer semester,
            String subjectCode) {

        List<Result> results;

        if (semester != null) {
            results = resultRepository.findBySemesterOrderBySubjectCodeAsc(semester);
        } else if (subjectCode != null && !subjectCode.isBlank()) {
            results = resultRepository.findBySubjectCodeIgnoreCase(subjectCode.trim());
        } else {
            results = resultRepository.findAll();
        }

        return results.stream()
                .map(ResultResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ResultResponse> getByStudent(
            String studentId,
            Integer semester) {

        List<Result> results;

        if (semester != null) {

            results = resultRepository
                    .findByStudentIdAndSemesterOrderBySubjectCodeAsc(
                            studentId.trim(),
                            semester
                    );

            if (results == null || results.isEmpty()) {
                results = resultRepository
                        .findByStudentIdIgnoreCaseAndSemesterOrderBySubjectCodeAsc(
                                studentId.trim(),
                                semester
                        );
            }

        } else {

            results = resultRepository
                    .findByStudentIdOrderBySemesterAscSubjectCodeAsc(
                            studentId.trim()
                    );

            if (results == null || results.isEmpty()) {
                results = resultRepository
                        .findByStudentIdIgnoreCaseOrderBySemesterAscSubjectCodeAsc(
                                studentId.trim()
                        );
            }
        }

        return results.stream()
                .map(ResultResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public TranscriptResponse getTranscript(String studentId) {

        List<Result> all =
                resultRepository
                        .findByStudentIdOrderBySemesterAscSubjectCodeAsc(
                                studentId.trim()
                        );

        if (all == null || all.isEmpty()) {
            all = resultRepository
                    .findByStudentIdIgnoreCaseOrderBySemesterAscSubjectCodeAsc(
                            studentId.trim()
                    );
        }

        Map<Integer, List<Result>> bySemester =
                new TreeMap<>();

        for (Result result : all) {

            bySemester
                    .computeIfAbsent(
                            result.getSemester(),
                            key -> new ArrayList<>()
                    )
                    .add(result);
        }

        List<SemesterTranscript> semesters =
                new ArrayList<>();

        int overallCredits = 0;
        int overallEarned = 0;
        int failedSubjects = 0;

        long overallWeighted = 0;

        for (Map.Entry<Integer, List<Result>> entry
                : bySemester.entrySet()) {

            int semesterCredits = 0;
            int semesterEarned = 0;

            long semesterWeighted = 0;

            for (Result result : entry.getValue()) {

                semesterCredits += result.getCredits();

                semesterWeighted +=
                        result.getGradePoint().longValue()
                                * result.getCredits();

                if ("F".equals(result.getGrade())) {

                    failedSubjects++;

                } else {

                    semesterEarned += result.getCredits();
                }
            }

            overallCredits += semesterCredits;
            overallEarned += semesterEarned;
            overallWeighted += semesterWeighted;

            List<ResultResponse> subjects =
                    entry.getValue()
                            .stream()
                            .map(ResultResponse::from)
                            .toList();

            semesters.add(
                    new SemesterTranscript(
                            entry.getKey(),
                            subjects,
                            semesterCredits,
                            semesterEarned,
                            average(
                                    semesterWeighted,
                                    semesterCredits
                            )
                    )
            );
        }

        return new TranscriptResponse(
                studentId,
                semesters,
                all.size(),
                failedSubjects,
                overallCredits,
                overallEarned,
                average(
                        overallWeighted,
                        overallCredits
                )
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStats() {
        long totalResults = resultRepository.count();
        List<Result> all = resultRepository.findAll();
        long passed = all.stream().filter(r -> !"F".equalsIgnoreCase(r.getGrade())).count();
        double passRate = totalResults > 0 ? Math.round(passed * 10000.0 / totalResults) / 100.0 : 0.0;
        return Map.of(
                "totalResults", totalResults,
                "passedCount", passed,
                "failedCount", totalResults - passed,
                "passRate", passRate
        );
    }

    // ==============================
    // Helper Methods
    // ==============================

    private void validateMarks(ResultRequest request) {

        if (request.getMarks()
                .compareTo(request.getMaxMarks()) > 0) {

            throw new BadRequestException(
                    "marks cannot exceed maxMarks"
            );
        }
    }

    private void applyRequest(
            Result result,
            ResultRequest request) {

        BigDecimal marks =
                request.getMarks()
                        .setScale(2, RoundingMode.HALF_UP);

        BigDecimal maxMarks =
                request.getMaxMarks()
                        .setScale(2, RoundingMode.HALF_UP);

        BigDecimal percentage =
                GradeCalculator.calculatePercentage(
                        marks,
                        maxMarks
                );

        String grade =
                GradeCalculator.calculateGrade(
                        percentage
                );

        BigDecimal gradePoint =
                GradeCalculator.calculateGradePoint(
                        grade
                );

        result.setStudentId(
                request.getStudentId().trim()
        );

        result.setSubjectCode(
                normalizeCode(request.getSubjectCode())
        );

        result.setSubjectName(
                request.getSubjectName().trim()
        );

        result.setSemester(
                request.getSemester()
        );

        result.setCredits(
                request.getCredits()
        );

        result.setMarks(marks);

        result.setMaxMarks(maxMarks);

        result.setPercentage(percentage);

        result.setGrade(grade);

        result.setGradePoint(gradePoint);
    }

    private BigDecimal average(
            long weightedPoints,
            int credits) {

        if (credits == 0) {

            return BigDecimal.ZERO
                    .setScale(2, RoundingMode.HALF_UP);
        }

        return BigDecimal.valueOf(weightedPoints)
                .divide(
                        BigDecimal.valueOf(credits),
                        2,
                        RoundingMode.HALF_UP
                );
    }

    private String normalizeCode(String code) {

        return code
                .trim()
                .toUpperCase(Locale.ROOT);
    }

    private DuplicateResourceException duplicate(
            String studentId,
            String subjectCode,
            Integer semester) {

        return new DuplicateResourceException(
                "A result for student '"
                        + studentId
                        + "', subject '"
                        + subjectCode
                        + "', semester "
                        + semester
                        + " already exists"
        );
    }
}