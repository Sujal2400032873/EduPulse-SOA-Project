package com.edupulse.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

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

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("prof_sharma", "sharma@edupulse.edu", "encodedPassword123", Role.ROLE_FACULTY);
        sampleUser.setId(1L);
    }

    @Test
    @DisplayName("Login with valid credentials returns AuthResponse with token and role")
    void testSuccessfulLogin() {
        LoginRequest request = new LoginRequest("prof_sharma", "Faculty@123");
        Authentication auth = new UsernamePasswordAuthenticationToken("prof_sharma", "Faculty@123");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase("prof_sharma", "prof_sharma")).thenReturn(Optional.of(sampleUser));
        when(jwtService.generateToken(sampleUser)).thenReturn("mocked.jwt.token");
        when(jwtService.getExpirationMs()).thenReturn(3600000L);

        AuthResponse response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.accessToken()).isEqualTo("mocked.jwt.token");
        assertThat(response.username()).isEqualTo("prof_sharma");
        assertThat(response.role()).isEqualTo("ROLE_FACULTY");
    }

    @Test
    @DisplayName("Login with incorrect credentials propagates BadCredentialsException")
    void testLoginWithWrongPassword() {
        LoginRequest request = new LoginRequest("prof_sharma", "WrongPassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Bad credentials");
    }

    @Test
    @DisplayName("Public self-registration automatically assigns ROLE_STUDENT")
    void testPublicRegistrationCreatesStudentRole() {
        RegisterRequest request = new RegisterRequest("new_student", "student@edupulse.edu", "Student@123");

        when(userRepository.existsByUsernameIgnoreCase("new_student")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("student@edupulse.edu")).thenReturn(false);
        when(passwordEncoder.encode("Student@123")).thenReturn("hashedPassword456");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(2L);
            return u;
        });

        UserResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.username()).isEqualTo("new_student");
        assertThat(response.role()).isEqualTo("ROLE_STUDENT");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Admin-only user creation allows assigning specific roles")
    void testAdminCreateFacultyUser() {
        CreateUserRequest request = new CreateUserRequest("new_faculty", "faculty@edupulse.edu", "Faculty@123", Role.ROLE_FACULTY);

        when(userRepository.existsByUsernameIgnoreCase("new_faculty")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("faculty@edupulse.edu")).thenReturn(false);
        when(passwordEncoder.encode("Faculty@123")).thenReturn("hashedPassword789");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(3L);
            return u;
        });

        UserResponse response = authService.createUserByAdmin(request);

        assertThat(response).isNotNull();
        assertThat(response.username()).isEqualTo("new_faculty");
        assertThat(response.role()).isEqualTo("ROLE_FACULTY");
    }

    @Test
    @DisplayName("Register with existing username throws DuplicateResourceException")
    void testRegisterDuplicateUsername() {
        RegisterRequest request = new RegisterRequest("prof_sharma", "new@edupulse.edu", "Pass@123");

        when(userRepository.existsByUsernameIgnoreCase("prof_sharma")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Username 'prof_sharma' is already taken");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Register with existing email throws DuplicateResourceException")
    void testRegisterDuplicateEmail() {
        RegisterRequest request = new RegisterRequest("unique_user", "sharma@edupulse.edu", "Pass@123");

        when(userRepository.existsByUsernameIgnoreCase("unique_user")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("sharma@edupulse.edu")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Email 'sharma@edupulse.edu' is already registered");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Get user by non-existent username throws ResourceNotFoundException")
    void testGetUserNotFound() {
        when(userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase("ghost_user", "ghost_user")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.getCurrentUser("ghost_user"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
    }
}
