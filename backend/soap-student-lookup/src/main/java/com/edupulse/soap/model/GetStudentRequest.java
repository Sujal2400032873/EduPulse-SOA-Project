package com.edupulse.soap.model;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlType;

@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = {"studentId"})
@XmlRootElement(name = "getStudentRequest", namespace = "http://edupulse.com/soap/students")
public class GetStudentRequest {

    @XmlElement(namespace = "http://edupulse.com/soap/students", required = true)
    private String studentId;

    public GetStudentRequest() {
    }

    public GetStudentRequest(String studentId) {
        this.studentId = studentId;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }
}
