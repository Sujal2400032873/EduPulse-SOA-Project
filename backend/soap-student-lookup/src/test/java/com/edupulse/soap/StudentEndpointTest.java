package com.edupulse.soap;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.edupulse.soap.endpoint.StudentEndpoint;
import com.edupulse.soap.model.GetStudentRequest;
import com.edupulse.soap.model.GetStudentResponse;

@SpringBootTest
class StudentEndpointTest {

    @Autowired
    private StudentEndpoint studentEndpoint;

    @Test
    @DisplayName("SOAP endpoint returns Aarav Sharma for STU1001")
    void testGetStudentExisting() {
        GetStudentRequest request = new GetStudentRequest("STU1001");
        GetStudentResponse response = studentEndpoint.getStudent(request);

        assertThat(response).isNotNull();
        assertThat(response.getStudent()).isNotNull();
        assertThat(response.getStudent().getStudentId()).isEqualTo("STU1001");
        assertThat(response.getStudent().getName()).isEqualTo("Aarav Sharma");
        assertThat(response.getStudent().getDepartment()).isEqualTo("Computer Science");
        assertThat(response.getStudent().getStatus()).isEqualTo("ACTIVE");
    }

    @Test
    @DisplayName("SOAP endpoint returns populated DTO for any student lookup")
    void testGetStudentGeneric() {
        GetStudentRequest request = new GetStudentRequest("STU2002");
        GetStudentResponse response = studentEndpoint.getStudent(request);

        assertThat(response).isNotNull();
        assertThat(response.getStudent().getStudentId()).isEqualTo("STU2002");
        assertThat(response.getStudent().getName()).contains("STU2002");
    }
}
