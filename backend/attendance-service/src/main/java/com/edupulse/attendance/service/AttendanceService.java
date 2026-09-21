package com.edupulse.attendance.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.edupulse.attendance.dto.AttendancePercentageResponse;
import com.edupulse.attendance.dto.AttendanceRequest;
import com.edupulse.attendance.dto.AttendanceResponse;
import com.edupulse.attendance.dto.SubjectAttendanceResponse;
import com.edupulse.attendance.entity.Attendance;
import com.edupulse.attendance.entity.AttendanceStatus;
import com.edupulse.attendance.exception.DuplicateResourceException;
import com.edupulse.attendance.exception.ResourceNotFoundException;
import com.edupulse.attendance.repository.AttendanceRepository;
import com.edupulse.attendance.repository.SubjectSummary;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;

    public AttendanceService(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    @Transactional
    public AttendanceResponse mark(
            AttendanceRequest request,
            String markedBy) {

        String studentId = request.studentId().trim();
        String subject = normalizeSubject(request.subject());

        if (attendanceRepository
                .existsByStudentIdAndSubjectAndDate(
                        studentId,
                        subject,
                        request.date())) {

            throw new DuplicateResourceException(
                    "Attendance for student '"
                            + studentId
                            + "', subject '"
                            + subject
                            + "' on "
                            + request.date()
                            + " already exists");
        }

        Attendance attendance = new Attendance();

        attendance.setStudentId(studentId);
        attendance.setSubject(subject);
        attendance.setDate(request.date());
        attendance.setStatus(request.status());
        attendance.setMarkedBy(markedBy);

        return AttendanceResponse.from(
                attendanceRepository.save(attendance));
    }

    @Transactional
    public AttendanceResponse update(
            Long id,
            AttendanceRequest request,
            String updatedBy) {

        Attendance attendance =
                attendanceRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Attendance record with id "
                                                + id
                                                + " not found"));

        String studentId = request.studentId().trim();
        String subject = normalizeSubject(request.subject());

        if (attendanceRepository
                .existsByStudentIdAndSubjectAndDateAndIdNot(
                        studentId,
                        subject,
                        request.date(),
                        id)) {

            throw new DuplicateResourceException(
                    "Attendance for student '"
                            + studentId
                            + "', subject '"
                            + subject
                            + "' on "
                            + request.date()
                            + " already exists");
        }

        attendance.setStudentId(studentId);
        attendance.setSubject(subject);
        attendance.setDate(request.date());
        attendance.setStatus(request.status());
        attendance.setLastUpdatedBy(updatedBy);

        return AttendanceResponse.from(
                attendanceRepository.save(attendance));
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getByStudent(
            String studentId,
            String subject) {

        List<Attendance> records;

        if (subject != null && !subject.isBlank()) {

            records =
                    attendanceRepository
                            .findByStudentIdAndSubjectOrderByDateDesc(
                                    studentId,
                                    normalizeSubject(subject));

        } else {

            records =
                    attendanceRepository
                            .findByStudentIdOrderByDateDescSubjectAsc(
                                    studentId);
        }

        return records.stream()
                .map(AttendanceResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AttendancePercentageResponse getPercentage(
            String studentId) {

        List<SubjectSummary> rows =
                attendanceRepository.summarizeBySubject(
                        studentId,
                        AttendanceStatus.PRESENT);

        long totalAll = 0;
        long presentAll = 0;

        List<SubjectAttendanceResponse> subjectWise =
                new ArrayList<>();

        for (SubjectSummary row : rows) {

            long total =
                    row.getTotal() == null
                            ? 0
                            : row.getTotal().longValue();

            long present =
                    row.getPresent() == null
                            ? 0
                            : row.getPresent().longValue();

            totalAll += total;
            presentAll += present;

            subjectWise.add(
                    new SubjectAttendanceResponse(
                            row.getSubject(),
                            total,
                            present,
                            total - present,
                            percentage(present, total)));
        }

        return new AttendancePercentageResponse(
                studentId,
                totalAll,
                presentAll,
                totalAll - presentAll,
                percentage(presentAll, totalAll),
                subjectWise);
    }

    private double percentage(
            long present,
            long total) {

        if (total == 0) {
            return 0.0;
        }

        return Math.round(
                present * 10000.0 / total) / 100.0;
    }

    private String normalizeSubject(String subject) {

        return subject
                .trim()
                .toUpperCase(Locale.ROOT);
    }
}