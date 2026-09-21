package com.edupulse.auth.dto;

import java.time.LocalDateTime;

import com.edupulse.auth.entity.User;

public record UserResponse(

        Long id,

        String username,

        String email,

        String role,

        LocalDateTime createdAt

) {

    public static UserResponse from(User user) {

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.getCreatedAt()
        );
    }
}