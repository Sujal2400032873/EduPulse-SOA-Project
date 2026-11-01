package com.edupulse.result.controller;

import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import com.edupulse.result.client.StudentServiceClient;
import com.edupulse.result.exception.ResourceNotFoundException;
import com.edupulse.result.security.JwtService;

@SpringBootTest
class ResultControllerIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private StudentServiceClient studentServiceClient;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    @DisplayName("Health endpoint is public and returns UP")
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/results/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("RESULT-SERVICE"));
    }

    @Test
    @DisplayName("POST /api/results records student marks with dynamically generated JWT token")
    void testCreateResult() throws Exception {
        doNothing().when(studentServiceClient).validateStudentExists("2400032152");

        String json = """
            {
                "studentId": "2400032152",
                "subjectCode": "24SDCS99",
                "subjectName": "SOA Advanced",
                "semester": 5,
                "credits": 2,
                "marks": 92,
                "maxMarks": 100.0
            }
            """;

        String token = jwtService.generateToken("faculty1", "ROLE_FACULTY");

        mockMvc.perform(post("/api/results")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.studentId").value("2400032152"))
                .andExpect(jsonPath("$.subjectCode").value("24SDCS99"))
                .andExpect(jsonPath("$.subjectName").value("SOA Advanced"))
                .andExpect(jsonPath("$.semester").value(5))
                .andExpect(jsonPath("$.credits").value(2))
                .andExpect(jsonPath("$.grade").value("O"))
                .andExpect(jsonPath("$.percentage").value(92.00));
    }

    @Test
    @DisplayName("POST /api/results fails with 404 when student does not exist in Student Service")
    void testCreateResultStudentNotFound() throws Exception {
        doThrow(new ResourceNotFoundException("Student with id 'STU9999' not found"))
                .when(studentServiceClient).validateStudentExists("STU9999");

        String json = """
            {
                "studentId": "STU9999",
                "subjectCode": "24SDCS03",
                "subjectName": "SOA",
                "semester": 5,
                "credits": 2,
                "marks": 92,
                "maxMarks": 100.0
            }
            """;

        String token = jwtService.generateToken("faculty1", "ROLE_FACULTY");

        mockMvc.perform(post("/api/results")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Student with id 'STU9999' not found"));
    }

    @Test
    @DisplayName("GET /api/results/stats returns results statistics using generated ADMIN token")
    void testGetStats() throws Exception {
        String token = jwtService.generateToken("admin", "ROLE_ADMIN");

        mockMvc.perform(get("/api/results/stats")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalResults").isNumber());
    }

    @Test
    @DisplayName("POST /api/results without authentication header returns 401 Unauthorized")
    void testCreateWithoutAuth() throws Exception {
        String json = """
            {
                "studentId": "2400032152",
                "subjectCode": "24SDCS03",
                "subjectName": "SOA",
                "semester": 5,
                "credits": 2,
                "marks": 92,
                "maxMarks": 100.0
            }
            """;

        mockMvc.perform(post("/api/results")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/results with malformed JWT token returns 401 Unauthorized")
    void testCreateWithMalformedToken() throws Exception {
        String json = """
            {
                "studentId": "2400032152",
                "subjectCode": "24SDCS03",
                "subjectName": "SOA",
                "semester": 5,
                "credits": 2,
                "marks": 92,
                "maxMarks": 100.0
            }
            """;

        mockMvc.perform(post("/api/results")
                        .header("Authorization", "Bearer not.a.valid.jwt.token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isUnauthorized());
    }
}
