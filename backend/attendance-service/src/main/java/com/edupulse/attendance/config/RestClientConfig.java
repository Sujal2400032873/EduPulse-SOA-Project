
package com.edupulse.attendance.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    // Normal client - for fixed URLs such as Eureka
    @Bean
    @Primary
    RestClient.Builder restClientBuilder() {
        return RestClient.builder();
    }

    // Load-balanced client - for service-to-service communication
    @Bean
    @LoadBalanced
    @Qualifier("loadBalancedRestClientBuilder")
    RestClient.Builder loadBalancedRestClientBuilder() {
        return RestClient.builder();
    }
}
