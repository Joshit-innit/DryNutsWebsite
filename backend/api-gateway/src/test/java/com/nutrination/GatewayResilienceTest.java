package com.nutrination;

import static org.assertj.core.api.Assertions.assertThat;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.reactive.server.WebTestClient;

/** Boots the real gateway in front of throwaway HTTP servers. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "eureka.client.enabled=false",
        "spring.cloud.loadbalancer.cache.enabled=false",
        "resilience4j.timelimiter.configs.default.timeout-duration=1s",
        "resilience4j.circuitbreaker.configs.default.wait-duration-in-open-state=60s",
})
class GatewayResilienceTest {
    private static HttpServer first;
    private static HttpServer second;
    private static HttpServer failing;
    private static HttpServer slow;
    private static final AtomicInteger firstHits = new AtomicInteger();
    private static final AtomicInteger secondHits = new AtomicInteger();
    private static final AtomicInteger failingHits = new AtomicInteger();

    @LocalServerPort
    private int port;

    private static HttpServer server(int status, long delayMillis, AtomicInteger hits) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/", exchange -> {
            hits.incrementAndGet();
            try {
                Thread.sleep(delayMillis);
            } catch (InterruptedException interrupted) {
                Thread.currentThread().interrupt();
            }
            byte[] body = "{}".getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(status, body.length);
            exchange.getResponseBody().write(body);
            exchange.close();
        });
        server.start();
        return server;
    }

    private static String url(HttpServer server) {
        return "http://127.0.0.1:" + server.getAddress().getPort();
    }

    @DynamicPropertySource
    static void services(DynamicPropertyRegistry registry) throws IOException {
        first = server(200, 0, firstHits);
        second = server(200, 0, secondHits);
        failing = server(503, 0, failingHits);
        slow = server(200, 3000, new AtomicInteger());
        registry.add("nutrination.services.product-service", () -> url(first) + "," + url(second));
        registry.add("nutrination.services.customer-service", () -> url(failing));
        registry.add("nutrination.services.order-service", () -> url(slow));
    }

    @AfterAll
    static void stopServers() {
        for (HttpServer server : new HttpServer[] {first, second, failing, slow}) {
            server.stop(0);
        }
    }

    private WebTestClient client() {
        return WebTestClient.bindToServer().baseUrl("http://127.0.0.1:" + port).build();
    }

    @Test
    void sharesRequestsBetweenInstancesInTurn() {
        firstHits.set(0);
        secondHits.set(0);
        for (int request = 0; request < 10; request++) {
            client().get().uri("/api/v1/products").exchange().expectStatus().isOk();
        }
        assertThat(firstHits.get()).isEqualTo(5);
        assertThat(secondHits.get()).isEqualTo(5);
    }

    @Test
    void opensTheCircuitAndAnswersFromTheFallback() {
        for (int request = 0; request < 5; request++) {
            client().post().uri("/api/v1/auth/login").exchange()
                    .expectStatus().isEqualTo(HttpStatus.SERVICE_UNAVAILABLE)
                    .expectBody().jsonPath("$.service").isEqualTo("customer-service");
        }
        int hitsBeforeOpen = failingHits.get();

        client().post().uri("/api/v1/auth/login").exchange()
                .expectStatus().isEqualTo(HttpStatus.SERVICE_UNAVAILABLE)
                .expectHeader().valueEquals("Retry-After", "20");
        assertThat(failingHits.get()).isEqualTo(hitsBeforeOpen);
    }

    @Test
    void timesOutASlowServiceInsteadOfHanging() {
        client().get().uri("/api/v1/orders").exchange()
                .expectStatus().isEqualTo(HttpStatus.SERVICE_UNAVAILABLE)
                .expectBody().jsonPath("$.service").isEqualTo("order-service");
    }
}
