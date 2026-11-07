package com.nutrination;

import java.net.URI;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.cloud.client.DefaultServiceInstance;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.ReactiveDiscoveryClient;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Flux;

/**
 * Feeds the load balancer on hosts without Eureka, such as Render: each
 * {@code nutrination.services.<name>} entry is a comma-separated list of base URLs.
 * Services with no URLs are left for Eureka to answer.
 */
@Configuration
@EnableConfigurationProperties(StaticServiceDiscovery.Services.class)
public class StaticServiceDiscovery implements ReactiveDiscoveryClient {
    private final Map<String, String> services;

    StaticServiceDiscovery(Services services) {
        this.services = services.services();
    }

    @Override
    public String description() {
        return "Service URLs from configuration";
    }

    @Override
    public Flux<ServiceInstance> getInstances(String serviceId) {
        String urls = services.getOrDefault(serviceId, "");
        return Flux.fromIterable(parse(serviceId, urls));
    }

    @Override
    public Flux<String> getServices() {
        return Flux.fromIterable(services.keySet());
    }

    private static List<ServiceInstance> parse(String serviceId, String urls) {
        return Arrays.stream(urls.split(","))
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

    @ConfigurationProperties("nutrination")
    public record Services(Map<String, String> services) {
        public Services {
            services = services == null ? Map.of() : services;
        }
    }
}
