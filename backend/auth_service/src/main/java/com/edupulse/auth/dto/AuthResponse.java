package com.edupulse.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AuthResponse(
        Long id,
        String username,
        String email,
        String role,
        String accessToken,
        @JsonProperty("token")
        String token,
        String tokenType,
        long expiresInMs
) {
    public AuthResponse(String accessToken, String tokenType, long expiresInMs, String username, String role) {
        this(null, username, null, role, accessToken, accessToken, tokenType, expiresInMs);
    }

    public AuthResponse(Long id, String username, String email, String role, String token, String tokenType, long expiresInMs) {
        this(id, username, email, role, token, token, tokenType, expiresInMs);
    }
}