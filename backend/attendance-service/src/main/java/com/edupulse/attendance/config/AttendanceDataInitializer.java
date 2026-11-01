package com.edupulse.attendance.config;

import java.time.LocalDate;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.edupulse.attendance.entity.Attendance;
import com.edupulse.attendance.entity.AttendanceStatus;
import com.edupulse.attendance.repository.AttendanceRepository;

@Component
public class AttendanceDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AttendanceDataInitializer.class);

    private final AttendanceRepository attendanceRepository;

    public AttendanceDataInitializer(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    private record SeedEntry(String studentId, String subject, LocalDate date, AttendanceStatus status, String markedBy) {}

    @Override
    @Transactional
    public void run(String... args) {
        LocalDate today = LocalDate.now();
        List<SeedEntry> seeds = List.of(
                new SeedEntry("STU1001", "DISTRIBUTED SYSTEMS & SOA", today.minusDays(1), AttendanceStatus.PRESENT, "faculty1"),
                new SeedEntry("STU1001", "DISTRIBUTED SYSTEMS & SOA", today, AttendanceStatus.PRESENT, "faculty1"),
                new SeedEntry("STU1001", "DATABASE MANAGEMENT SYSTEMS", today.minusDays(2), AttendanceStatus.PRESENT, "faculty1"),
                new SeedEntry("2400032152", "DISTRIBUTED SYSTEMS & SOA", today.minusDays(1), AttendanceStatus.PRESENT, "faculty1"),
                new SeedEntry("2400032152", "DATABASE MANAGEMENT SYSTEMS", today, AttendanceStatus.PRESENT, "faculty1"),
                new SeedEntry("STU2026", "DISTRIBUTED SYSTEMS & SOA", today.minusDays(1), AttendanceStatus.PRESENT, "faculty1"),
                new SeedEntry("STU2026", "DISTRIBUTED SYSTEMS & SOA", today, AttendanceStatus.PRESENT, "faculty1")
        );

        for (SeedEntry s : seeds) {
            if (!attendanceRepository.existsByStudentIdAndSubjectAndDate(s.studentId(), s.subject(), s.date())) {
                Attendance att = new Attendance();
                att.setStudentId(s.studentId());
                att.setSubject(s.subject());
                att.setDate(s.date());
                att.setStatus(s.status());
                att.setMarkedBy(s.markedBy());
                attendanceRepository.save(att);
                log.info("Seeded attendance for {} in {} on {}", s.studentId(), s.subject(), s.date());
            }
        }
    }
}
