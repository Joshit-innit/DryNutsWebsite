package com.nutrination.service;

import com.nutrination.client.CustomerClient;
import com.nutrination.client.ProductClient;
import com.nutrination.entity.CustomerOrder;
import com.nutrination.entity.OrderTimelineStep;
import com.nutrination.repository.OrderRepository;
import feign.FeignException;
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductClient productClient;
    private final CustomerClient customerClient;

    public OrderService(OrderRepository orderRepository, ProductClient productClient, CustomerClient customerClient) {
        this.orderRepository = orderRepository;
        this.productClient = productClient;
        this.customerClient = customerClient;
    }

    @Transactional(readOnly = true)
    public List<CustomerOrder> findAll() {
        return orderRepository.findAll();
    }

    @Transactional(readOnly = true)
    public CustomerOrder findByIdOrNumber(String id) {
        return orderRepository.findByOrderNumber(id)
                .or(() -> orderRepository.findById(id))
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + id));
    }

    @Transactional
    public CustomerOrder create(CustomerOrder order) {
        if (order.getCustomerId() != null && !order.getCustomerId().isBlank()) {
            verifyCustomer(order.getCustomerId());
        }
        order.getItems().forEach(item -> verifyProduct(item.getProductId()));
        order.setId(order.getId() == null ? "ord-" + System.currentTimeMillis() : order.getId());
        order.setOrderNumber(order.getOrderNumber() == null ? orderNumber() : order.getOrderNumber());
        order.setDate(order.getDate() == null ? LocalDate.now() : order.getDate());
        order.setEstimatedDelivery(order.getEstimatedDelivery() == null ? LocalDate.now().plusDays(4) : order.getEstimatedDelivery());
        order.setTrackingNumber(order.getTrackingNumber() == null ? trackingNumber() : order.getTrackingNumber());
        order.setPaymentStatus("COD".equalsIgnoreCase(order.getPaymentMethod()) ? "Pending" : "Paid");
        if (order.getTimeline().isEmpty()) {
            order.setTimeline(defaultTimeline());
        }
        order.syncChildren();
        return orderRepository.save(order);
    }

    /** customer-service only returns the record to that customer or an admin (token forwarded by the client). */
    private void verifyCustomer(String customerId) {
        try {
            customerClient.getCustomer(customerId);
        } catch (FeignException.Unauthorized e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in to place an order for a customer account");
        } catch (FeignException.Forbidden e) {
            // customer-service answers 403 both without a token and with another customer's token.
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sign in as this customer to place an order on their account");
        } catch (FeignException.NotFound e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown customer: " + customerId);
        } catch (FeignException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Customer service unavailable", e);
        }
    }

    private void verifyProduct(String productId) {
        try {
            productClient.getProduct(productId);
        } catch (FeignException.NotFound e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown product: " + productId);
        } catch (FeignException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Product service unavailable", e);
        }
    }

    @Transactional
    public CustomerOrder updateStatus(String id, String status) {
        CustomerOrder order = findByIdOrNumber(id);
        order.setStatus(status);
        order.getTimeline().forEach(step -> {
            if (step.getStatus().equalsIgnoreCase(status)) {
                step.setIsCurrent(true);
                step.setIsCompleted(true);
                step.setTimestamp("Updated now");
            } else if (step.getIsCurrent()) {
                step.setIsCurrent(false);
            }
        });
        return orderRepository.save(order);
    }

    private String orderNumber() {
        return "NN-2026-" + (1000 + new Random().nextInt(9000));
    }

    private String trackingNumber() {
        return "EXP-" + Long.toString(System.nanoTime(), 36).toUpperCase(Locale.ROOT);
    }

    private List<OrderTimelineStep> defaultTimeline() {
        return List.of(
                step("Pending", "Order Placed", "Order received successfully", true, false),
                step("Confirmed", "Confirmed & Verified", "Harvest inventory reserved", true, true),
                step("Packed", "Clean-room Packing", "Vacuum nitrogen sealing", false, false),
                step("Shipped", "Express Dispatch", "Air logistics partner pickup", false, false),
                step("Out for Delivery", "Out for Delivery", "Last-mile courier", false, false),
                step("Delivered", "Delivered", "Delivered to doorstep", false, false)
        );
    }

    private OrderTimelineStep step(String status, String label, String description, boolean completed, boolean current) {
        OrderTimelineStep step = new OrderTimelineStep();
        step.setId("step-" + status.toLowerCase(Locale.ROOT).replaceAll("\\s+", "-"));
        step.setStatus(status);
        step.setLabel(label);
        step.setDescription(description);
        step.setTimestamp(completed ? "Just now" : null);
        step.setIsCompleted(completed);
        step.setIsCurrent(current);
        return step;
    }
}
