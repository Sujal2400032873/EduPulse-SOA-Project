package com.edupulse.student.controller;

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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest
class StudentControllerIntegrationTest {

    @Autowired
    private WebApplicationContext context;

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
        mockMvc.perform(get("/api/students/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("STUDENT-SERVICE"));
    }

    @Test
    @WithMockUser(roles = "FACULTY")
    @DisplayName("Student exists check returns false for non-existent student")
    void testStudentExistsNotFound() throws Exception {
        mockMvc.perform(get("/api/students/NONEXISTENT999/exists"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exists").value(false))
                .andExpect(jsonPath("$.studentId").value("NONEXISTENT999"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/students creates new student when authorized as ADMIN")
    void testCreateStudent() throws Exception {
        String json = """
            {
                "studentId": "STU8888",
                "name": "Priya Patel",
                "email": "priya.unique8888@edupulse.edu",
                "phone": "9876543211",
                "dateOfBirth": "2003-08-20",
                "gender": "FEMALE",
                "department": "Electronics",
                "year": 3,
                "section": "B",
                "admissionYear": 2023
            }
            """;

        mockMvc.perform(post("/api/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.studentId").value("STU8888"))
                .andExpect(jsonPath("$.name").value("Priya Patel"))
                .andExpect(jsonPath("$.department").value("Electronics"));

        // Verify exists endpoint now returns true
        mockMvc.perform(get("/api/students/STU8888/exists"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exists").value(true));
    }

    @Test
    @WithMockUser(roles = "FACULTY")
    @DisplayName("GET /api/students/stats returns statistics to FACULTY")
    void testGetStats() throws Exception {
        mockMvc.perform(get("/api/students/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalStudents").isNumber());
    }

    @Test
    @DisplayName("POST /api/students without authentication is rejected")
    void testCreateWithoutAuth() throws Exception {
        String json = """
            {
                "studentId": "STU7777",
                "name": "Anonymous",
                "email": "anon@edupulse.edu",
                "dateOfBirth": "2003-01-01",
                "gender": "MALE",
                "department": "Mechanical",
                "year": 1,
                "admissionYear": 2024
            }
            """;

        mockMvc.perform(post("/api/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isUnauthorized());
    }
}
