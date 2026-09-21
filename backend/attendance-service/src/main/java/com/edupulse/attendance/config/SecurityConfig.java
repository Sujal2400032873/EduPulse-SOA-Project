package com.edupulse.attendance.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.edupulse.attendance.security.JwtAuthenticationFilter;
import com.edupulse.attendance.security.JwtService;
import com.edupulse.attendance.security.RestAccessDeniedHandler;
import com.edupulse.attendance.security.RestAuthenticationEntryPoint;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtService jwtService,
            RestAuthenticationEntryPoint authenticationEntryPoint,
            RestAccessDeniedHandler accessDeniedHandler)
            throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .httpBasic(basic -> basic.disable())

                .formLogin(form -> form.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS))

                .exceptionHandling(ex ->
                        ex
                                .authenticationEntryPoint(
                                        authenticationEntryPoint)
                                .accessDeniedHandler(
                                        accessDeniedHandler))

                .authorizeHttpRequests(auth ->
                        auth
                                .requestMatchers("/error")
                                .permitAll()

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/attendance/me",
                                        "/api/attendance/me/percentage")
                                .hasRole("STUDENT")

                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/attendance")
                                .hasAnyRole("ADMIN", "FACULTY")

                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/attendance/**")
                                .hasAnyRole("ADMIN", "FACULTY")

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/attendance/student/**")
                                .hasAnyRole("ADMIN", "FACULTY")

                                .anyRequest()
                                .denyAll())

                .addFilterBefore(
                        new JwtAuthenticationFilter(jwtService),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}