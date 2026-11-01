package com.edupulse.soap.model;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlType;

@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = {"student"})
@XmlRootElement(name = "getStudentResponse", namespace = "http://edupulse.com/soap/students")
public class GetStudentResponse {

    @XmlElement(namespace = "http://edupulse.com/soap/students", required = true)
    private StudentSoapDto student;

    public GetStudentResponse() {
    }

    public GetStudentResponse(StudentSoapDto student) {
        this.student = student;
    }

    public StudentSoapDto getStudent() {
        return student;
    }

    public void setStudent(StudentSoapDto student) {
        this.student = student;
    }
}
