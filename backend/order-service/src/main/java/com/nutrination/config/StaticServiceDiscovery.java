package com.nutrination.config;

import java.net.URI;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.client.DefaultServiceInstance;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.context.annotation.Configuration;

/**
 * Feeds the Feign load balancer on hosts without Eureka, such as Render: each
 * {@code nutrination.services.<name>} entry is a comma-separated list of base URLs.
 * Services with no URLs are left for Eureka to answer.
 */
@Configuration
@EnableConfigurationProperties(StaticServiceDiscovery.Services.class)
public class StaticServiceDiscovery implements DiscoveryClient {
    private final Map<String, String> services;

    StaticServiceDiscovery(Services services) {
        this.services = services.services();
    }

    @Override
    public String description() {
        return "Service URLs from configuration";
    }

    @Override
    public List<ServiceInstance> getInstances(String serviceId) {
        return Arrays.stream(services.getOrDefault(serviceId, "").split(","))
                .map(String::trim)
                .filter(url -> !url.isEmpty())
                .<ServiceInstance>map(url -> {
                    URI uri = URI.create(url);
                    boolean secure = "https".equalsIgnoreCase(uri.getScheme());
                    int port = uri.getPort() != -1 ? uri.getPort() : secure ? 443 : 80;
                    return new DefaultServiceInstance(serviceId + "@" + uri.getAuthority(), serviceId, uri.getHost(), port, secure);
                })
                .toList();
    }

    @Override
    public List<String> getServices() {
        return List.copyOf(services.keySet());
    }

    @ConfigurationProperties("nutrination")
    public record Services(Map<String, String> services) {
        public Services {
            services = services == null ? Map.of() : services;
        }
    }
}
