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

    public ResultService(ResultRepository resultRepository) {
        this.resultRepository = resultRepository;
    }

    @Transactional
    public ResultResponse create(ResultRequest request, String recordedBy) {

        validateMarks(request);

        String studentId = request.getStudentId().trim();
        String subjectCode = normalizeCode(request.getSubjectCode());

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

        return ResultResponse.from(
                resultRepository.save(result)
        );
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
    public List<ResultResponse> getByStudent(
            String studentId,
            Integer semester) {

        List<Result> results;

        if (semester != null) {

            results = resultRepository
                    .findByStudentIdAndSemesterOrderBySubjectCodeAsc(
                            studentId,
                            semester
                    );

        } else {

            results = resultRepository
                    .findByStudentIdOrderBySemesterAscSubjectCodeAsc(
                            studentId
                    );
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
                                studentId
                        );

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