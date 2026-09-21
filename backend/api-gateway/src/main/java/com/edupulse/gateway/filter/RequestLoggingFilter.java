package com.edupulse.gateway.filter;

import java.net.URI;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.support.ServerWebExchangeUtils;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

@Component
public class RequestLoggingFilter implements GlobalFilter, Ordered {

    private static final Logger log =
            LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    public Mono<Void> filter(
            ServerWebExchange exchange,
            GatewayFilterChain chain) {

        long start = System.currentTimeMillis();

        String method =
                exchange.getRequest().getMethod().name();

        String path =
                exchange.getRequest().getURI().getPath();

        return chain.filter(exchange).then(Mono.fromRunnable(() -> {

            // After routing, this contains the actual
            // service instance selected by the load balancer
            URI target =
                    exchange.getAttribute(
                            ServerWebExchangeUtils.GATEWAY_REQUEST_URL_ATTR);

            HttpStatusCode status =
                    exchange.getResponse().getStatusCode();

            long elapsed =
                    System.currentTimeMillis() - start;

            log.info(
                    "{} {} -> {} | status={} | {} ms",
                    method,
                    path,
                    target,
                    (status != null ? status.value() : "n/a"),
                    elapsed
            );
        }));
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}