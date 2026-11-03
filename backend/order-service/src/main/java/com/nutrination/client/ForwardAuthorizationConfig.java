package com.nutrination.client;

import feign.RequestInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpHeaders;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Passes the caller's bearer token on to customer-service, so its owner-or-admin
 * check runs against the user who placed the order. Not a @Configuration on
 * purpose: it is applied only to the clients that name it.
 */
public class ForwardAuthorizationConfig {
    @Bean
    RequestInterceptor forwardAuthorizationHeader() {
        return template -> {
            if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
                HttpServletRequest request = attributes.getRequest();
                String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
                if (authorization != null && !authorization.isBlank()) {
                    template.header(HttpHeaders.AUTHORIZATION, authorization);
                }
            }
        };
    }
}
