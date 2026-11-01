package com.edupulse.result.config;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.edupulse.result.entity.Result;
import com.edupulse.result.repository.ResultRepository;
import com.edupulse.result.service.GradeCalculator;

@Component
public class ResultDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ResultDataInitializer.class);

    private final ResultRepository resultRepository;

    public ResultDataInitializer(ResultRepository resultRepository) {
        this.resultRepository = resultRepository;
    }

    private record SeedResult(
            String studentId,
            String subjectCode,
            String subjectName,
            BigDecimal marks,
            BigDecimal maxMarks,
            Integer semester,
            Integer credits,
            String recordedBy
    ) {}

    @Override
    @Transactional
    public void run(String... args) {
        List<SeedResult> seeds = List.of(
                // Aarav Sharma (STU1001) - Semesters 1, 2, 3, 4
                new SeedResult("STU1001", "CS101", "Fundamentals of Computing", new BigDecimal("94.00"), new BigDecimal("100.00"), 1, 4, "faculty1"),
                new SeedResult("STU1001", "CS102", "Engineering Mathematics I", new BigDecimal("88.50"), new BigDecimal("100.00"), 1, 4, "faculty1"),
                new SeedResult("STU1001", "CS103", "Digital Electronics", new BigDecimal("91.00"), new BigDecimal("100.00"), 1, 3, "faculty1"),
                new SeedResult("STU1001", "CS201", "Data Structures & Algorithms", new BigDecimal("95.00"), new BigDecimal("100.00"), 2, 4, "faculty1"),
                new SeedResult("STU1001", "CS202", "Object Oriented Programming", new BigDecimal("86.00"), new BigDecimal("100.00"), 2, 4, "faculty1"),
                new SeedResult("STU1001", "CS203", "Discrete Mathematical Structures", new BigDecimal("89.00"), new BigDecimal("100.00"), 2, 3, "faculty1"),
                new SeedResult("STU1001", "CS301", "Computer Architecture & Org", new BigDecimal("92.00"), new BigDecimal("100.00"), 3, 4, "faculty1"),
                new SeedResult("STU1001", "CS302", "Operating Systems Principles", new BigDecimal("87.50"), new BigDecimal("100.00"), 3, 4, "faculty1"),
                new SeedResult("STU1001", "CS303", "Theory of Computation", new BigDecimal("90.50"), new BigDecimal("100.00"), 3, 3, "faculty1"),
                new SeedResult("STU1001", "CS401", "Distributed Systems & SOA", new BigDecimal("96.00"), new BigDecimal("100.00"), 4, 4, "faculty1"),
                new SeedResult("STU1001", "CS402", "Database Management Systems", new BigDecimal("88.00"), new BigDecimal("100.00"), 4, 4, "faculty1"),
                new SeedResult("STU1001", "CS403", "Computer Networks & Security", new BigDecimal("93.00"), new BigDecimal("100.00"), 4, 4, "faculty1"),

                // Aditya Kumar (2400032152) - Semesters 3, 4, 5
                new SeedResult("2400032152", "CS301", "Computer Architecture & Org", new BigDecimal("89.00"), new BigDecimal("100.00"), 3, 4, "faculty1"),
                new SeedResult("2400032152", "CS302", "Operating Systems Principles", new BigDecimal("92.00"), new BigDecimal("100.00"), 3, 4, "faculty1"),
                new SeedResult("2400032152", "CS401", "Distributed Systems & SOA", new BigDecimal("94.00"), new BigDecimal("100.00"), 4, 4, "faculty1"),
                new SeedResult("2400032152", "CS402", "Database Management Systems", new BigDecimal("90.00"), new BigDecimal("100.00"), 4, 4, "faculty1"),
                new SeedResult("2400032152", "24SDCS03", "Advanced Cloud Infrastructure", new BigDecimal("93.00"), new BigDecimal("100.00"), 5, 4, "admin"),
                new SeedResult("2400032152", "24SDCS04", "Microservices Engineering", new BigDecimal("88.00"), new BigDecimal("100.00"), 5, 4, "faculty1"),

                // Priya Patel (STU2026) - Semesters 4, 5
                new SeedResult("STU2026", "CS401", "Distributed Systems & SOA", new BigDecimal("95.00"), new BigDecimal("100.00"), 4, 4, "admin"),
                new SeedResult("STU2026", "CS402", "Database Management Systems", new BigDecimal("91.00"), new BigDecimal("100.00"), 4, 4, "faculty1"),
                new SeedResult("STU2026", "AI501", "Machine Learning Foundations", new BigDecimal("94.50"), new BigDecimal("100.00"), 5, 4, "admin"),
                new SeedResult("STU2026", "AI502", "Neural Networks & Deep Learning", new BigDecimal("89.00"), new BigDecimal("100.00"), 5, 4, "faculty1"),

                // Rohan Varma (STU1002) - Semesters 1, 2
                new SeedResult("STU1002", "CS101", "Fundamentals of Computing", new BigDecimal("85.00"), new BigDecimal("100.00"), 1, 4, "faculty1"),
                new SeedResult("STU1002", "CS102", "Engineering Mathematics I", new BigDecimal("82.00"), new BigDecimal("100.00"), 1, 4, "faculty1"),
                new SeedResult("STU1002", "CS201", "Data Structures & Algorithms", new BigDecimal("91.00"), new BigDecimal("100.00"), 2, 4, "faculty1")
        );

        for (SeedResult s : seeds) {
            if (!resultRepository.existsByStudentIdAndSubjectCodeAndSemester(s.studentId(), s.subjectCode(), s.semester())) {
                BigDecimal marks = s.marks().setScale(2, RoundingMode.HALF_UP);
                BigDecimal maxMarks = s.maxMarks().setScale(2, RoundingMode.HALF_UP);
                BigDecimal percentage = GradeCalculator.calculatePercentage(marks, maxMarks);
                String grade = GradeCalculator.calculateGrade(percentage);
                BigDecimal gradePoint = GradeCalculator.calculateGradePoint(grade);

                Result r = new Result();
                r.setStudentId(s.studentId());
                r.setSubjectCode(s.subjectCode());
                r.setSubjectName(s.subjectName());
                r.setMarks(marks);
                r.setMaxMarks(maxMarks);
                r.setPercentage(percentage);
                r.setGrade(grade);
                r.setGradePoint(gradePoint);
                r.setSemester(s.semester());
                r.setCredits(s.credits());
                r.setRecordedBy(s.recordedBy());

                resultRepository.save(r);
                log.info("Seeded academic result for {} - {} (Grade: {})", s.studentId(), s.subjectCode(), grade);
            }
        }
    }
}
