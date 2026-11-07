package com.nutrination.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.nutrination.client.CustomerClient;
import com.nutrination.client.ProductClient;
import com.nutrination.entity.CustomerOrder;
import com.nutrination.entity.OrderItem;
import com.nutrination.repository.OrderRepository;
import feign.FeignException;
import feign.Request;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class OrderServiceCircuitBreakerTest {
    private final ProductClient products = mock(ProductClient.class);
    private CircuitBreakerRegistry registry;
    private OrderService service;

    @BeforeEach
    void setUp() {
        registry = CircuitBreakerRegistry.of(CircuitBreakerConfig.custom()
                .slidingWindowSize(4)
                .minimumNumberOfCalls(4)
                .failureRateThreshold(50)
                .ignoreExceptions(FeignException.NotFound.class)
                .build());
        OrderRepository orders = mock(OrderRepository.class);
        when(orders.save(any())).thenAnswer(call -> call.getArgument(0));
        service = new OrderService(orders, products, mock(CustomerClient.class), registry);
    }

    private static CustomerOrder orderFor(String productId) {
        OrderItem item = new OrderItem();
        item.setProductId(productId);
        CustomerOrder order = new CustomerOrder();
        order.setItems(List.of(item));
        order.setPaymentMethod("UPI");
        return order;
    }

    private static Request request() {
        return Request.create(Request.HttpMethod.GET, "/", new HashMap<>(), new byte[0], StandardCharsets.UTF_8, null);
    }

    private HttpStatus statusOfPlacingAnOrder() {
        var error = assertThrows(ResponseStatusException.class, () -> service.create(orderFor("p1")));
        return HttpStatus.valueOf(error.getStatusCode().value());
    }

    @Test
    void opensAfterRepeatedFailuresAndStopsCallingTheProductService() {
        when(products.getProduct(anyString()))
                .thenThrow(new FeignException.ServiceUnavailable("down", request(), null, null));

        for (int call = 0; call < 4; call++) {
            assertEquals(HttpStatus.SERVICE_UNAVAILABLE, statusOfPlacingAnOrder());
        }
        assertEquals(CircuitBreaker.State.OPEN, registry.circuitBreaker("productClient").getState());

        clearInvocations(products);
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, statusOfPlacingAnOrder());
        verify(products, never()).getProduct(anyString());
    }

    @Test
    void anUnknownProductIsTheCallersMistakeAndNeverOpensTheBreaker() {
        when(products.getProduct(anyString()))
                .thenThrow(new FeignException.NotFound("missing", request(), null, null));

        for (int call = 0; call < 8; call++) {
            assertEquals(HttpStatus.BAD_REQUEST, statusOfPlacingAnOrder());
        }
        assertEquals(CircuitBreaker.State.CLOSED, registry.circuitBreaker("productClient").getState());
    }

    @Test
    void anOnlineOrderIsNeverMarkedPaidWithoutAGateway() {
        assertEquals("Pending", service.create(orderFor("p1")).getPaymentStatus());
    }
}
