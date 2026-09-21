package com.edupulse.result.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.edupulse.result.entity.Result;

public interface ResultRepository extends JpaRepository<Result, Long> {

    boolean existsByStudentIdAndSubjectCodeAndSemester(
            String studentId,
            String subjectCode,
            Integer semester
    );

    boolean existsByStudentIdAndSubjectCodeAndSemesterAndIdNot(
            String studentId,
            String subjectCode,
            Integer semester,
            Long id
    );

    List<Result> findByStudentIdOrderBySemesterAscSubjectCodeAsc(
            String studentId
    );

    List<Result> findByStudentIdAndSemesterOrderBySubjectCodeAsc(
            String studentId,
            Integer semester
    );
}