package com.edupulse.auth.config;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.edupulse.auth.entity.Role;
import com.edupulse.auth.entity.User;
import com.edupulse.auth.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminUsername;
    private final String adminEmail;
    private final String adminPassword;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder,
            @Value("${app.admin.username:admin}") String adminUsername,
            @Value("${app.admin.email:admin@gmail.com}") String adminEmail,
            @Value("${app.admin.password:Admin123}") String adminPassword) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminUsername = adminUsername;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    private record SeedUser(String username, String email, String password, Role role) {}

    @Override
    public void run(String... args) {
        List<SeedUser> defaultUsers = List.of(
                new SeedUser(adminUsername, adminEmail, adminPassword, Role.ROLE_ADMIN),
                new SeedUser("faculty1", "faculty1@edupulse.edu", "Password@123", Role.ROLE_FACULTY),
                new SeedUser("prof_mehta", "prof.mehta@edupulse.edu", "Password@123", Role.ROLE_FACULTY),
                new SeedUser("STU1001", "aarav.sharma@edupulse.edu", "Student@123", Role.ROLE_STUDENT),
                new SeedUser("2400032152", "aditya.kumar@edupulse.edu", "Student@123", Role.ROLE_STUDENT),
                new SeedUser("STU2026", "priya.patel@edupulse.edu", "Student@123", Role.ROLE_STUDENT),
                new SeedUser("STU1002", "rohan.varma@edupulse.edu", "Student@123", Role.ROLE_STUDENT),
                new SeedUser("STU1003", "ananya.iyer@edupulse.edu", "Student@123", Role.ROLE_STUDENT),
                new SeedUser("STU1004", "siddharth.rao@edupulse.edu", "Student@123", Role.ROLE_STUDENT),
                new SeedUser("STU1005", "neha.gupta@edupulse.edu", "Student@123", Role.ROLE_STUDENT),
                new SeedUser("STU1006", "vikram.malhotra@edupulse.edu", "Student@123", Role.ROLE_STUDENT)
        );

        for (SeedUser seed : defaultUsers) {
            userRepository.findByUsernameIgnoreCase(seed.username()).ifPresentOrElse(
                    user -> {
                        user.setEmail(seed.email());
                        user.setPassword(passwordEncoder.encode(seed.password()));
                        user.setRole(seed.role());
                        userRepository.save(user);
                        log.info("Synchronized user '{}' with role {}", seed.username(), seed.role());
                    },
                    () -> {
                        User user = new User(seed.username(), seed.email(), passwordEncoder.encode(seed.password()), seed.role());
                        userRepository.save(user);
                        log.info("Seeded default user '{}' with role {}", seed.username(), seed.role());
                    }
            );
        }
    }
}