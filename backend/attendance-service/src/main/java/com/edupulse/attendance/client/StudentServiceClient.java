
package com.edupulse.attendance.client;

import java.time.Duration;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.edupulse.attendance.exception.ResourceNotFoundException;

import jakarta.servlet.http.HttpServletRequest;

@Component
public class StudentServiceClient {

    private static final Logger log = LoggerFactory.getLogger(StudentServiceClient.class);

    private static final String STUDENT_SERVICE_URL = "http://student-service";

    private final RestClient restClient;

    public StudentServiceClient(
            @Qualifier("loadBalancedRestClientBuilder")
            RestClient.Builder restClientBuilder) {

        SimpleClientHttpRequestFactory requestFactory =
                new SimpleClientHttpRequestFactory();

        requestFactory.setConnectTimeout(Duration.ofSeconds(3));
        requestFactory.setReadTimeout(Duration.ofSeconds(3));

        this.restClient = restClientBuilder
                .requestFactory(requestFactory)
                .build();
    }

    public void validateStudentExists(String studentId) {

        if (studentId == null || studentId.isBlank()) {
            throw new ResourceNotFoundException("studentId is required");
        }

        String token = resolveCurrentBearerToken();

        try {

            var requestSpec = restClient.get()
                    .uri(
                        STUDENT_SERVICE_URL + "/api/students/{studentId}/exists",
                        studentId.trim()
                    );

            if (token != null && !token.isBlank()) {
                requestSpec.header(
                        HttpHeaders.AUTHORIZATION,
                        token.startsWith("Bearer ") ? token : "Bearer " + token
                );
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> response = requestSpec
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, resp) -> {
                        if (resp.getStatusCode().value() == 404) {
                            throw new ResourceNotFoundException(
                                    "Student with id '" + studentId + "' not found"
                            );
                        }
                    })
                    .body(Map.class);

            if (response != null && Boolean.FALSE.equals(response.get("exists"))) {
                throw new ResourceNotFoundException(
                        "Student with id '" + studentId + "' not found"
                );
            }

        } catch (ResourceNotFoundException e) {

            throw e;

        } catch (HttpClientErrorException.NotFound e) {

            throw new ResourceNotFoundException(
                    "Student with id '" + studentId + "' not found"
            );

        } catch (Exception e) {

            log.warn(
                    "Exists check failed for student '{}' on {}: {}. Attempting fallback lookup...",
                    studentId,
                    STUDENT_SERVICE_URL,
                    e.getMessage()
            );

            tryFallbackLookup(studentId, token);
        }
    }

    private void tryFallbackLookup(String studentId, String token) {

        try {

            var requestSpec = restClient.get()
                    .uri(
                        STUDENT_SERVICE_URL + "/api/students/student-id/{studentId}",
                        studentId.trim()
                    );

            if (token != null && !token.isBlank()) {
                requestSpec.header(
                        HttpHeaders.AUTHORIZATION,
                        token.startsWith("Bearer ") ? token : "Bearer " + token
                );
            }

            requestSpec.retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, resp) -> {
                        throw new ResourceNotFoundException(
                                "Student with id '" + studentId + "' not found"
                        );
                    })
                    .toBodilessEntity();

        } catch (ResourceNotFoundException e) {

            throw e;

        } catch (HttpClientErrorException.NotFound e) {

            throw new ResourceNotFoundException(
                    "Student with id '" + studentId + "' not found"
            );

        } catch (Exception e) {

            log.error(
                    "Student service validation failed for '{}': {}",
                    studentId,
                    e.getMessage()
            );

            if (e.getMessage() != null && e.getMessage().contains("404")) {
                throw new ResourceNotFoundException(
                        "Student with id '" + studentId + "' not found"
                );
            }

            throw new IllegalStateException(
                    "Student Service is unavailable: " + e.getMessage(),
                    e
            );
        }
    }

    private String resolveCurrentBearerToken() {

        try {

            ServletRequestAttributes attributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

            if (attributes != null) {

                HttpServletRequest req = attributes.getRequest();

                String header = req.getHeader(HttpHeaders.AUTHORIZATION);

                if (header != null && !header.isBlank()) {
                    return header;
                }
            }

        } catch (Exception ignored) {
        }

        try {

            Authentication auth =
                    SecurityContextHolder.getContext().getAuthentication();

            if (auth != null
                    && auth.getCredentials() instanceof String cred
                    && !cred.isBlank()) {

                return cred;
            }

        } catch (Exception ignored) {
        }

        return null;
    }
}
