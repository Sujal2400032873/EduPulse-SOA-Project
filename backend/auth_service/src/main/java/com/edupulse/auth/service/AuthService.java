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
        if (userRepository.existsByUsername(username)) {
            throw new DuplicateResourceException("Username '" + username + "' is already taken");
        }
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email '" + email + "' is already registered");
        }
        User user = new User(username, email, passwordEncoder.encode(rawPassword), role);
        return UserResponse.from(userRepository.save(user));
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));

        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, "Bearer", jwtService.getExpirationMs(), user.getUsername(),
                user.getRole().name());
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserResponse.from(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(UserResponse::from).toList();
    }
}