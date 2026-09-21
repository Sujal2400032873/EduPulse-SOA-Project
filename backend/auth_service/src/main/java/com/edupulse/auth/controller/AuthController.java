package com.edupulse.auth.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.edupulse.auth.dto.AuthResponse;
import com.edupulse.auth.dto.CreateUserRequest;
import com.edupulse.auth.dto.LoginRequest;
import com.edupulse.auth.dto.RegisterRequest;
import com.edupulse.auth.dto.UserResponse;
import com.edupulse.auth.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(
            Authentication authentication) {

        return ResponseEntity.ok(
                authService.getCurrentUser(
                        authentication.getName()));
    }

    // ADMIN only (enforced in SecurityConfig)
    @PostMapping("/users")
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody CreateUserRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(authService.createUserByAdmin(request));
    }

    // ADMIN only (enforced in SecurityConfig)
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> listUsers() {

        return ResponseEntity.ok(
                authService.getAllUsers());
    }
}