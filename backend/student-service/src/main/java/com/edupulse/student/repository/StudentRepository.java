package com.edupulse.student.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.edupulse.student.entity.Student;

public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByStudentId(String studentId);

    boolean existsByStudentId(String studentId);

    boolean existsByEmail(String email);

    boolean existsByStudentIdAndIdNot(String studentId, Long id);

    boolean existsByEmailAndIdNot(String email, Long id);

    List<Student> findByDepartmentIgnoreCase(String department);

    List<Student> findByNameContainingIgnoreCaseOrStudentIdContainingIgnoreCase(
            String name, String studentId);
}