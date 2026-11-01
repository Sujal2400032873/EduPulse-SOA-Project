package com.edupulse.result.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
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
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(
                    "/error",
                    "/api/results/health",
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html"
                ).permitAll()

                // STUDENT: own results and transcript
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/results/me",
                    "/api/results/me/**"
                ).hasRole("STUDENT")

                // ADMIN + FACULTY: view results & transcripts
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/results",
                    "/api/results/**"
                ).hasAnyRole("ADMIN", "FACULTY")

                // ADMIN + FACULTY: create results
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/results",
                    "/api/results/**"
                ).hasAnyRole("ADMIN", "FACULTY")

                // ADMIN + FACULTY: update results
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/results/**"
                ).hasAnyRole("ADMIN", "FACULTY")

                // ADMIN + FACULTY: delete results
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/results/**"
                ).hasAnyRole("ADMIN", "FACULTY")

                .anyRequest().authenticated()
            )
            .addFilterBefore(
                new JwtAuthenticationFilter(jwtService),
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOriginPatterns(List.of("http://localhost:*", "http://127.0.0.1:*"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setExposedHeaders(List.of("Authorization", "Content-Disposition", "X-Instance-Port", "X-Instance-Id"));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
