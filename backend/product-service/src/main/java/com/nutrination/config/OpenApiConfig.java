package com.nutrination.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    OpenAPI productOpenApi() {
        return new OpenAPI().info(new Info()
                .title("NutriNation Product Service")
                .version("1.0.0")
                .description("Catalog, categories, variants, pricing, stock, and nutrition APIs."));
    }
}
