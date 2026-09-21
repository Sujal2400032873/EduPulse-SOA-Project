package com.edupulse.student.service;

import java.util.List;

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

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
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

        return StudentResponse.from(
                studentRepository.save(student));
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

    @Transactional(readOnly = true)
    public StudentResponse getMyProfile(String username) {

        Student student = studentRepository
                .findByStudentId(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No student profile is linked to username '" +
                                username + "'"));

        return StudentResponse.from(student);
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