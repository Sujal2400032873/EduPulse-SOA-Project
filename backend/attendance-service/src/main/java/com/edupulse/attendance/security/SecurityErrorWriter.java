package com.edupulse.attendance.security;

import java.io.IOException;
import java.time.Instant;

import org.springframework.http.MediaType;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public final class SecurityErrorWriter {

    private SecurityErrorWriter() {
    }

    public static void write(
            HttpServletRequest request,
            HttpServletResponse response,
            int status,
            String error,
            String message) throws IOException {

        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        String body = "{"
                + "\"timestamp\":\"" + Instant.now() + "\","
                + "\"status\":" + status + ","
                + "\"error\":\"" + escape(error) + "\","
                + "\"message\":\"" + escape(message) + "\","
                + "\"path\":\"" + escape(request.getRequestURI()) + "\","
                + "\"fieldErrors\":{}"
                + "}";

        response.getWriter().write(body);
    }

    private static String escape(String value) {
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"");
    }
}