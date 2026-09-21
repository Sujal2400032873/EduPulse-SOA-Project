package com.edupulse.result.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.edupulse.result.security.JwtAuthenticationFilter;
import com.edupulse.result.security.JwtService;
import com.edupulse.result.security.RestAccessDeniedHandler;
import com.edupulse.result.security.RestAuthenticationEntryPoint;

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
                    SessionCreationPolicy.STATELESS
                )
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(authenticationEntryPoint)
                .accessDeniedHandler(accessDeniedHandler)
            )
            .authorizeHttpRequests(auth -> auth

                .requestMatchers("/error").permitAll()

                // STUDENT: own results and transcript
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/results/me",
                    "/api/results/me/transcript"
                ).hasRole("STUDENT")

                // ADMIN + FACULTY: create results
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/results"
                ).hasAnyRole("ADMIN", "FACULTY")

                // ADMIN + FACULTY: update results
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/results/**"
                ).hasAnyRole("ADMIN", "FACULTY")

                // ADMIN + FACULTY: view student results
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/results/student/**"
                ).hasAnyRole("ADMIN", "FACULTY")

                // ADMIN only: delete results
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/results/**"
                ).hasRole("ADMIN")

                // Everything else denied
                .anyRequest().denyAll()
            )
            .addFilterBefore(
                new JwtAuthenticationFilter(jwtService),
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}