package com.edupulse.student.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.edupulse.student.dto.StudentRequest;
import com.edupulse.student.dto.StudentResponse;
import com.edupulse.student.entity.Student;
import com.edupulse.student.exception.DuplicateResourceException;
import com.edupulse.student.exception.ResourceNotFoundException;
import com.edupulse.student.repository.StudentRepository;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final com.edupulse.student.event.StudentEventPublisher studentEventPublisher;

    public StudentService(
            StudentRepository studentRepository,
            com.edupulse.student.event.StudentEventPublisher studentEventPublisher) {
        this.studentRepository = studentRepository;
        this.studentEventPublisher = studentEventPublisher;
    }

    @Transactional
    public StudentResponse create(StudentRequest request) {

        if (studentRepository.existsByStudentId(request.studentId())) {
            throw new DuplicateResourceException(
                    "studentId '" + request.studentId() + "' already exists");
        }

        if (studentRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException(
                    "Email '" + request.email() + "' already exists");
        }

        Student student = new Student();

        apply(student, request);

        Student saved = studentRepository.save(student);

        if (studentEventPublisher != null) {
            studentEventPublisher.publishStudentCreated(
                    com.edupulse.student.event.StudentCreatedEvent.of(
                            saved.getStudentId(),
                            saved.getName(),
                            saved.getEmail(),
                            saved.getDepartment(),
                            saved.getYear()
                    )
            );
        }

        return StudentResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<StudentResponse> getAll(
            String keyword,
            String department) {

        List<Student> students;

        if (keyword != null && !keyword.isBlank()) {

            String k = keyword.trim();

            students = studentRepository
                    .findByNameContainingIgnoreCaseOrStudentIdContainingIgnoreCase(
                            k, k);

        } else if (department != null && !department.isBlank()) {

            students = studentRepository
                    .findByDepartmentIgnoreCase(department.trim());

        } else {

            students = studentRepository.findAll();
        }

        return students.stream()
                .map(StudentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public StudentResponse getById(Long id) {

        return StudentResponse.from(findById(id));
    }

    @Transactional(readOnly = true)
    public StudentResponse getByStudentId(String studentId) {

        Student student = studentRepository
                .findByStudentId(studentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Student with studentId '" +
                                studentId + "' not found"));

        return StudentResponse.from(student);
    }

    @Transactional
    public StudentResponse getMyProfile(String username) {
        if (username == null || username.isBlank()) {
            throw new ResourceNotFoundException("Username is required");
        }

        String trimmed = username.trim();

        // 1. Check by studentId (exact or case-insensitive)
        Optional<Student> studentOpt = studentRepository.findByStudentIdIgnoreCase(trimmed);

        // 2. Check by email (exact or case-insensitive)
        if (studentOpt.isEmpty()) {
            studentOpt = studentRepository.findByEmailIgnoreCase(trimmed);
        }

        // 3. Self-healing sync: If student authenticated via auth-service but no demographic record exists yet,
        // auto-provision initial matriculation profile to ensure complete synchronization.
        Student student = studentOpt.orElseGet(() -> {
            Student s = new Student();
            s.setStudentId(trimmed.toUpperCase());
            s.setName(trimmed);
            s.setEmail(trimmed.contains("@") ? trimmed.toLowerCase() : trimmed.toLowerCase() + "@edupulse.edu");
            s.setPhone("9876500000");
            s.setDepartment("Computer Science");
            s.setYear(1);
            s.setSection("A");
            s.setAdmissionYear(java.time.Year.now().getValue());
            s.setGender(com.edupulse.student.entity.Gender.OTHER);
            s.setDateOfBirth(java.time.LocalDate.of(2005, 1, 1));
            return studentRepository.save(s);
        });

        return StudentResponse.from(student);
    }

    @Transactional
    public StudentResponse updateMyProfile(String username, StudentRequest request) {
        if (username == null || username.isBlank()) {
            throw new ResourceNotFoundException("Username is required");
        }

        String trimmed = username.trim();
        Student student = studentRepository.findByStudentIdIgnoreCase(trimmed)
                .or(() -> studentRepository.findByEmailIgnoreCase(trimmed))
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for " + trimmed));

        if (studentRepository.existsByEmailAndIdNot(request.email(), student.getId())) {
            throw new DuplicateResourceException("Email '" + request.email() + "' already exists");
        }

        student.setName(request.name());
        student.setEmail(request.email());
        student.setPhone(request.phone());
        student.setDateOfBirth(request.dateOfBirth());
        student.setGender(request.gender());
        student.setDepartment(request.department());
        student.setYear(request.year());
        student.setSection(request.section());
        student.setAdmissionYear(request.admissionYear());

        return StudentResponse.from(studentRepository.save(student));
    }

    @Transactional
    public StudentResponse update(
            Long id,
            StudentRequest request) {

        Student student = findById(id);

        if (studentRepository
                .existsByStudentIdAndIdNot(
                        request.studentId(), id)) {

            throw new DuplicateResourceException(
                    "studentId '" +
                    request.studentId() +
                    "' already exists");
        }

        if (studentRepository
                .existsByEmailAndIdNot(
                        request.email(), id)) {

            throw new DuplicateResourceException(
                    "Email '" +
                    request.email() +
                    "' already exists");
        }

        apply(student, request);

        return StudentResponse.from(
                studentRepository.save(student));
    }

    @Transactional
    public void delete(Long id) {

        Student student = findById(id);

        studentRepository.delete(student);
    }

    @Transactional(readOnly = true)
    public boolean existsByStudentId(String studentId) {
        return studentRepository.existsByStudentId(studentId != null ? studentId.trim() : "");
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getStats() {
        long totalStudents = studentRepository.count();
        List<Student> all = studentRepository.findAll();
        long totalDepartments = all.stream().map(Student::getDepartment).distinct().count();
        return java.util.Map.of(
                "totalStudents", totalStudents,
                "totalDepartments", totalDepartments
        );
    }

    private Student findById(Long id) {

        return studentRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Student with id " +
                                id + " not found"));
    }

    private void apply(
            Student student,
            StudentRequest request) {

        student.setStudentId(
                request.studentId().trim());

        student.setName(
                request.name().trim());

        student.setEmail(
                request.email().trim());

        student.setPhone(
                request.phone());

        student.setDateOfBirth(
                request.dateOfBirth());

        student.setGender(
                request.gender());

        student.setDepartment(
                request.department().trim());

        student.setYear(
                request.year());

        student.setSection(
                request.section());

        student.setAdmissionYear(
                request.admissionYear());
    }
}