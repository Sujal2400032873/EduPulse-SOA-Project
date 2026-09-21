package com.edupulse.result.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class ResultRequest {

    @NotBlank
    @Size(min = 3, max = 20)
    @Pattern(regexp = "^[A-Za-z0-9]+$")
    private String studentId;

    @NotBlank
    @Size(min = 2, max = 20)
    @Pattern(regexp = "^[A-Za-z0-9]+$")
    private String subjectCode;

    @NotBlank
    @Size(max = 100)
    private String subjectName;

    @NotNull
    @DecimalMin(value = "0.0")
    @Digits(integer = 4, fraction = 2)
    private BigDecimal marks;

    @NotNull
    @DecimalMin(value = "0.01")
    @Digits(integer = 4, fraction = 2)
    private BigDecimal maxMarks;

    @NotNull
    @Min(1)
    @Max(12)
    private Integer semester;

    @NotNull
    @Min(1)
    @Max(10)
    private Integer credits;

    public ResultRequest() {
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getSubjectCode() {
        return subjectCode;
    }

    public void setSubjectCode(String subjectCode) {
        this.subjectCode = subjectCode;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public BigDecimal getMarks() {
        return marks;
    }

    public void setMarks(BigDecimal marks) {
        this.marks = marks;
    }

    public BigDecimal getMaxMarks() {
        return maxMarks;
    }

    public void setMaxMarks(BigDecimal maxMarks) {
        this.maxMarks = maxMarks;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public Integer getCredits() {
        return credits;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
    }
}