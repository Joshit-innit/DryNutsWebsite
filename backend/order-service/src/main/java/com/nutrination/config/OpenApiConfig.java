package com.nutrination.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    OpenAPI orderOpenApi() {
        return new OpenAPI().info(new Info()
                .title("NutriNation Order Service")
                .version("1.0.0")
                .description("Order placement, fulfillment status, and Feign service communication APIs."));
    }
}
