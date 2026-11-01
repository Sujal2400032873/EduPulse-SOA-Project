package com.edupulse.auth.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.edupulse.auth.entity.Role;
import com.edupulse.auth.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

class JwtServiceTest {

    private JwtService jwtService;
    private final String secret = "EduPulseJWTSecretKey2026ForStudentAuthVeryLongKey";
    private final long expirationMs = 3600000;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(secret, expirationMs);
        sampleUser = new User("aarav", "aarav@edupulse.edu", "encodedPassword", Role.ROLE_STUDENT);
        sampleUser.setId(10L);
    }

    @Test
    @DisplayName("Should generate valid token containing username, role, and userId")
    void testGenerateToken() {
        String token = jwtService.generateToken(sampleUser);

        assertThat(token).isNotBlank();
        Claims claims = jwtService.parseToken(token);
        assertThat(claims.getSubject()).isEqualTo("aarav");
        assertThat(claims.get("role", String.class)).isEqualTo("ROLE_STUDENT");
        assertThat(claims.get("userId", Long.class)).isEqualTo(10L);
    }

    @Test
    @DisplayName("Should reject secret shorter than 32 characters")
    void testShortSecretFails() {
        assertThatThrownBy(() -> new JwtService("shortKey", 3600000))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("must be at least 32 characters");
    }

    @Test
    @DisplayName("Should reject tampered token")
    void testTamperedToken() {
        String validToken = jwtService.generateToken(sampleUser);
        String tampered = validToken.substring(0, validToken.length() - 6) + "xxxxxx";

        assertThatThrownBy(() -> jwtService.parseToken(tampered))
                .isInstanceOf(JwtException.class);
    }

    @Test
    @DisplayName("Should reject token signed with different secret key")
    void testTokenWithWrongKey() {
        String otherSecret = "AnotherSecretKeyForTestingPurposesOnly123456789";
        SecretKey otherKey = Keys.hmacShaKeyFor(otherSecret.getBytes(StandardCharsets.UTF_8));
        String forgedToken = Jwts.builder()
                .subject("hacker")
                .claim("role", "ROLE_ADMIN")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 60000))
                .signWith(otherKey)
                .compact();

        assertThatThrownBy(() -> jwtService.parseToken(forgedToken))
                .isInstanceOf(JwtException.class);
    }
}
