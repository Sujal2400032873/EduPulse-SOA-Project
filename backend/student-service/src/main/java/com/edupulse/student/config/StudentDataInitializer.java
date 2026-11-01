package com.edupulse.student.config;

import java.time.LocalDate;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.edupulse.student.entity.Gender;
import com.edupulse.student.entity.Student;
import com.edupulse.student.repository.StudentRepository;

@Component
public class StudentDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(StudentDataInitializer.class);

    private final StudentRepository studentRepository;

    public StudentDataInitializer(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    private record SeedStudent(
            String studentId,
            String name,
            String email,
            String phone,
            LocalDate dateOfBirth,
            Gender gender,
            String department,
            Integer year,
            String section,
            Integer admissionYear
    ) {}

    @Override
    @Transactional
    public void run(String... args) {
        List<SeedStudent> defaultStudents = List.of(
                new SeedStudent(
                        "STU1001",
                        "Aarav Sharma",
                        "aarav.sharma@edupulse.edu",
                        "9876543210",
                        LocalDate.of(2004, 5, 15),
                        Gender.MALE,
                        "Computer Science",
                        2,
                        "A",
                        2024
                ),
                new SeedStudent(
                        "2400032152",
                        "Aditya Kumar",
                        "aditya.kumar@edupulse.edu",
                        "+919876543210",
                        LocalDate.of(2004, 6, 15),
                        Gender.MALE,
                        "Computer Science",
                        3,
                        "A",
                        2024
                ),
                new SeedStudent(
                        "STU2026",
                        "Priya Patel",
                        "priya.patel@edupulse.edu",
                        "9876543299",
                        LocalDate.of(2004, 8, 20),
                        Gender.FEMALE,
                        "Artificial Intelligence & Data Science",
                        3,
                        "B",
                        2023
                ),
                new SeedStudent(
                        "STU1002",
                        "Rohan Varma",
                        "rohan.varma@edupulse.edu",
                        "9876500004",
                        LocalDate.of(2004, 3, 10),
                        Gender.MALE,
                        "Computer Science & Engineering",
                        2,
                        "B",
                        2024
                ),
                new SeedStudent(
                        "STU1003",
                        "Ananya Iyer",
                        "ananya.iyer@edupulse.edu",
                        "9876500005",
                        LocalDate.of(2004, 9, 25),
                        Gender.FEMALE,
                        "Artificial Intelligence & Data Science",
                        2,
                        "A",
                        2024
                ),
                new SeedStudent(
                        "STU1004",
                        "Siddharth Rao",
                        "siddharth.rao@edupulse.edu",
                        "9876500006",
                        LocalDate.of(2003, 4, 12),
                        Gender.MALE,
                        "Information Technology",
                        3,
                        "A",
                        2023
                ),
                new SeedStudent(
                        "STU1005",
                        "Neha Gupta",
                        "neha.gupta@edupulse.edu",
                        "9876500007",
                        LocalDate.of(2002, 12, 5),
                        Gender.FEMALE,
                        "Electronics & Communication Engineering",
                        4,
                        "A",
                        2022
                ),
                new SeedStudent(
                        "STU1006",
                        "Vikram Malhotra",
                        "vikram.malhotra@edupulse.edu",
                        "9876500008",
                        LocalDate.of(2002, 7, 19),
                        Gender.MALE,
                        "Computer Science & Engineering",
                        4,
                        "B",
                        2022
                )
        );

        for (SeedStudent seed : defaultStudents) {
            studentRepository.findByStudentIdIgnoreCase(seed.studentId()).ifPresentOrElse(
                    existing -> {
                        log.info("Student record for '{}' is active in PostgreSQL student.students", seed.studentId());
                    },
                    () -> {
                        Student s = new Student();
                        s.setStudentId(seed.studentId());
                        s.setName(seed.name());
                        s.setEmail(seed.email());
                        s.setPhone(seed.phone());
                        s.setDateOfBirth(seed.dateOfBirth());
                        s.setGender(seed.gender());
                        s.setDepartment(seed.department());
                        s.setYear(seed.year());
                        s.setSection(seed.section());
                        s.setAdmissionYear(seed.admissionYear());
                        studentRepository.save(s);
                        log.info("Seeded initial student profile '{}' in PostgreSQL student.students", seed.studentId());
                    }
            );
        }
    }
}
