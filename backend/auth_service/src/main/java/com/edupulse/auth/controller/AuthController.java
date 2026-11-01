package com.edupulse.auth.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.edupulse.auth.dto.AuthResponse;
import com.edupulse.auth.dto.CreateUserRequest;
import com.edupulse.auth.dto.LoginRequest;
import com.edupulse.auth.dto.RegisterRequest;
import com.edupulse.auth.dto.UserResponse;
import com.edupulse.auth.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication & Authorization", description = "Endpoints for user registration, login, and JWT verification")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register student user", description = "Public registration endpoint for students")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticate credentials and issue JWT token")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                authService.login(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Current user profile", description = "Get profile of currently authenticated user", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<UserResponse> me(
            Authentication authentication) {

        return ResponseEntity.ok(
                authService.getCurrentUser(
                        authentication.getName()));
    }

    @GetMapping("/verify")
    @Operation(summary = "Verify JWT session", description = "Validates active token and returns role claims", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<Map<String, Object>> verify(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("valid", false));
        }

        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_STUDENT");

        java.util.Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("valid", true);
        resp.put("username", authentication.getName());
        resp.put("role", role.replace("ROLE_", ""));

        try {
            UserResponse user = authService.getCurrentUser(authentication.getName());
            if (user != null) {
                resp.put("id", user.id());
                resp.put("email", user.email());
            }
        } catch (Exception ignored) {
        }

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Service health indicator")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "AUTH-SERVICE"
        ));
    }

    // ADMIN only (enforced in SecurityConfig)
    @PostMapping("/users")
    @Operation(summary = "Create user by administrator", description = "Admin endpoint to provision users with any role (ADMIN, FACULTY, STUDENT)", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody CreateUserRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(authService.createUserByAdmin(request));
    }

    // ADMIN only (enforced in SecurityConfig)
    @GetMapping("/users")
    @Operation(summary = "List all users", description = "Admin endpoint to view all system users with optional role and search filters", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<List<UserResponse>> listUsers(
            @Parameter(description = "Filter by user role (e.g. ROLE_ADMIN, ROLE_FACULTY, ROLE_STUDENT)")
            @RequestParam(required = false) String role,
            @Parameter(description = "Search keyword in username or email")
            @RequestParam(required = false) String search) {

        return ResponseEntity.ok(
                authService.getAllUsers(role, search));
    }
}