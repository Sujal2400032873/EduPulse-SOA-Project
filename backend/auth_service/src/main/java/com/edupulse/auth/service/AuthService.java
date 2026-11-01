package com.edupulse.auth.service;

import java.util.List;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.edupulse.auth.dto.AuthResponse;
import com.edupulse.auth.dto.CreateUserRequest;
import com.edupulse.auth.dto.LoginRequest;
import com.edupulse.auth.dto.RegisterRequest;
import com.edupulse.auth.dto.UserResponse;
import com.edupulse.auth.entity.Role;
import com.edupulse.auth.entity.User;
import com.edupulse.auth.exception.DuplicateResourceException;
import com.edupulse.auth.exception.ResourceNotFoundException;
import com.edupulse.auth.repository.UserRepository;
import com.edupulse.auth.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    /** Public self-registration: always creates a STUDENT. */
    @Transactional
    public UserResponse register(RegisterRequest request) {
        return createUser(request.username(), request.email(), request.password(), Role.ROLE_STUDENT);
    }

    /** Admin-only: create a user with any role. */
    @Transactional
    public UserResponse createUserByAdmin(CreateUserRequest request) {
        return createUser(request.username(), request.email(), request.password(), request.role());
    }

    private UserResponse createUser(String username, String email, String rawPassword, Role role) {
        String cleanUsername = username != null ? username.trim() : "";
        String cleanEmail = email != null ? email.trim().toLowerCase() : "";

        if (userRepository.existsByUsernameIgnoreCase(cleanUsername)) {
            throw new DuplicateResourceException("Username '" + cleanUsername + "' is already taken");
        }
        if (userRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new DuplicateResourceException("Email '" + cleanEmail + "' is already registered");
        }
        User user = new User(cleanUsername, cleanEmail, passwordEncoder.encode(rawPassword), role);
        return UserResponse.from(userRepository.save(user));
    }

    public AuthResponse login(LoginRequest request) {
        String identifier = request.username() != null ? request.username().trim() : "";

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(identifier, request.password()));

        User user = userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(authentication.getName(), authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = jwtService.generateToken(user);
        return new AuthResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                token,
                "Bearer",
                jwtService.getExpirationMs()
        );
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String username) {
        String identifier = username != null ? username.trim() : "";
        User user = userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(identifier, identifier)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserResponse.from(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return getAllUsers(null, null);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers(String role, String search) {
        return userRepository.findAll().stream()
                .filter(u -> {
                    if (role == null || role.isBlank()) return true;
                    String r = role.trim();
                    return u.getRole().name().equalsIgnoreCase(r)
                            || u.getRole().name().equalsIgnoreCase("ROLE_" + r)
                            || u.getRole().name().replace("ROLE_", "").equalsIgnoreCase(r.replace("ROLE_", ""));
                })
                .filter(u -> search == null || search.isBlank() || u.getUsername().toLowerCase().contains(search.toLowerCase()) || u.getEmail().toLowerCase().contains(search.toLowerCase()))
                .map(UserResponse::from)
                .toList();
    }
}