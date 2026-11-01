package com.edupulse.attendance.controller;

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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import com.edupulse.attendance.client.StudentServiceClient;
import com.edupulse.attendance.exception.ResourceNotFoundException;

@SpringBootTest
class AttendanceControllerIntegrationTest {

    @Autowired
    private WebApplicationContext context;

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
        mockMvc.perform(get("/api/attendance/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("ATTENDANCE-SERVICE"));
    }

    @Test
    @WithMockUser(roles = "FACULTY")
    @DisplayName("POST /api/attendance records attendance for existing student")
    void testMarkAttendance() throws Exception {
        doNothing().when(studentServiceClient).validateStudentExists("STU1001");

        String json = """
            {
                "studentId": "STU1001",
                "subject": "Cloud Computing",
                "date": "2026-10-18",
                "status": "PRESENT"
            }
            """;

        mockMvc.perform(post("/api/attendance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.studentId").value("STU1001"))
                .andExpect(jsonPath("$.status").value("PRESENT"));
    }

    @Test
    @WithMockUser(roles = "FACULTY")
    @DisplayName("POST /api/attendance fails with 404 when student does not exist")
    void testMarkAttendanceStudentNotFound() throws Exception {
        doThrow(new ResourceNotFoundException("Student with id 'STU9999' not found"))
                .when(studentServiceClient).validateStudentExists("STU9999");

        String json = """
            {
                "studentId": "STU9999",
                "subject": "Cloud Computing",
                "date": "2026-10-18",
                "status": "PRESENT"
            }
            """;

        mockMvc.perform(post("/api/attendance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Student with id 'STU9999' not found"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/attendance/stats returns stats for ADMIN")
    void testGetStats() throws Exception {
        mockMvc.perform(get("/api/attendance/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRecords").isNumber());
    }

    @Test
    @DisplayName("POST /api/attendance without authentication returns 401")
    void testMarkWithoutAuth() throws Exception {
        String json = """
            {
                "studentId": "STU1001",
                "subject": "Cloud Computing",
                "date": "2026-10-18",
                "status": "PRESENT"
            }
            """;

        mockMvc.perform(post("/api/attendance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isUnauthorized());
    }
}
