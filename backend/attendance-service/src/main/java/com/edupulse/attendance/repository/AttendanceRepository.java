package com.edupulse.attendance.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.edupulse.attendance.entity.Attendance;
import com.edupulse.attendance.entity.AttendanceStatus;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    boolean existsByStudentIdAndSubjectAndDate(
            String studentId,
            String subject,
            LocalDate date);

    boolean existsByStudentIdAndSubjectAndDateAndIdNot(
            String studentId,
            String subject,
            LocalDate date,
            Long id);

    List<Attendance> findByStudentIdOrderByDateDescSubjectAsc(
            String studentId);

    List<Attendance> findByStudentIdAndSubjectOrderByDateDesc(
            String studentId,
            String subject);

    @Query("""
            select a.subject as subject,
                   count(a) as total,
                   sum(case when a.status = :presentStatus then 1 else 0 end) as present
            from Attendance a
            where a.studentId = :studentId
            group by a.subject
            order by a.subject
            """)
    List<SubjectSummary> summarizeBySubject(
            @Param("studentId") String studentId,
            @Param("presentStatus") AttendanceStatus presentStatus);
}