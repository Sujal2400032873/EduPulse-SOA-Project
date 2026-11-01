package com.edupulse.student.config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class InstanceIdentifierFilter extends OncePerRequestFilter {

    @Value("${server.port:8082}")
    private String serverPort;

    @Value("${spring.application.name:student-service}")
    private String appName;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        response.setHeader("X-Instance-Port", serverPort);
        response.setHeader("X-Instance-Id", appName + ":" + serverPort);
        filterChain.doFilter(request, response);
    }
}

