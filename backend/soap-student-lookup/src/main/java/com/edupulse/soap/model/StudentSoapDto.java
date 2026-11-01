package com.edupulse.soap.model;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlType;

@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "studentSoapDto", namespace = "http://edupulse.com/soap/students", propOrder = {
        "studentId",
        "name",
        "email",
        "department",
        "year",
        "status"
})
public class StudentSoapDto {

    @XmlElement(namespace = "http://edupulse.com/soap/students", required = true)
    private String studentId;

    @XmlElement(namespace = "http://edupulse.com/soap/students", required = true)
    private String name;

    @XmlElement(namespace = "http://edupulse.com/soap/students", required = true)
    private String email;

    @XmlElement(namespace = "http://edupulse.com/soap/students", required = true)
    private String department;

    @XmlElement(namespace = "http://edupulse.com/soap/students")
    private int year;

    @XmlElement(namespace = "http://edupulse.com/soap/students", required = true)
    private String status;

    public StudentSoapDto() {
    }

    public StudentSoapDto(String studentId, String name, String email, String department, int year, String status) {
        this.studentId = studentId;
        this.name = name;
        this.email = email;
        this.department = department;
        this.year = year;
        this.status = status;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
