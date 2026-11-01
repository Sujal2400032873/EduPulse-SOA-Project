package com.edupulse.soap.endpoint;

import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;

import com.edupulse.soap.model.GetStudentRequest;
import com.edupulse.soap.model.GetStudentResponse;
import com.edupulse.soap.model.StudentSoapDto;

@Endpoint
public class StudentEndpoint {

    private static final String NAMESPACE_URI = "http://edupulse.com/soap/students";

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "getStudentRequest")
    @ResponsePayload
    public GetStudentResponse getStudent(@RequestPayload GetStudentRequest request) {
        String studentId = request.getStudentId();

        StudentSoapDto student;
        if ("STU1001".equalsIgnoreCase(studentId)) {
            student = new StudentSoapDto(
                    "STU1001",
                    "Aarav Sharma",
                    "aarav.sharma@edupulse.edu",
                    "Computer Science",
                    2,
                    "ACTIVE"
            );
        } else {
            student = new StudentSoapDto(
                    studentId != null ? studentId : "UNKNOWN",
                    "Student Profile (" + studentId + ")",
                    (studentId != null ? studentId.toLowerCase() : "student") + "@edupulse.edu",
                    "Information Technology",
                    1,
                    "ACTIVE"
            );
        }

        return new GetStudentResponse(student);
    }
}
