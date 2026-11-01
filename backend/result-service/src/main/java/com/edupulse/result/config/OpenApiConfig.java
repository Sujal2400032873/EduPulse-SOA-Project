package com.edupulse.result.config;

import java.util.List;

import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.parameters.Parameter;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI resultServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("EduPulse Result Service API")
                        .description("Academic Marks, Grading Rules, SGPA/CGPA, and Transcripts API")
                        .version("1.0.0")
                        .contact(new Contact().name("EduPulse Development Team")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("API Gateway (Port 8080)"),
                        new Server().url("http://localhost:8084").description("Result Service Standalone (Port 8084)"),
                        new Server().url("/").description("Current Host")
                ))
                .addSecurityItem(new SecurityRequirement().addList("BearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("BearerAuth",
                                new SecurityScheme()
                                        .name("BearerAuth")
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }

    @Bean
    public OperationCustomizer customizeOperations() {
        return (operation, handlerMethod) -> {
            if (operation.getSecurity() != null && !operation.getSecurity().isEmpty()) {
                operation.addParametersItem(
                        new Parameter()
                                .in("header")
                                .name("Authorization")
                                .description("JWT Bearer Token: 'Bearer <token>'. Can also be set globally in the Authorize button.")
                                .required(false)
                                .schema(new StringSchema().example("Bearer <jwt-token>"))
                );
            }
            return operation;
        };
    }
}
