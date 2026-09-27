package com.nutrination.config;

import com.nutrination.entity.CustomerOrder;
import com.nutrination.entity.OrderItem;
import com.nutrination.entity.OrderTimelineStep;
import com.nutrination.entity.ShippingAddress;
import com.nutrination.repository.OrderRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seedOrders(OrderRepository orderRepository) {
        return args -> {
            if (orderRepository.count() > 0) {
                return;
            }
            CustomerOrder order = new CustomerOrder();
            order.setId("ord-1");
            order.setOrderNumber("NN-2026-1001");
            order.setCustomerId("cust-1");
            order.setDate(LocalDate.now());
            order.setSubtotal(BigDecimal.valueOf(899));
            order.setDiscount(BigDecimal.ZERO);
            order.setDeliveryFee(BigDecimal.ZERO);
            order.setTotal(BigDecimal.valueOf(899));
            order.setStatus("Confirmed");
            order.setPaymentMethod("UPI");
            order.setPaymentStatus("Paid");
            order.setEstimatedDelivery(LocalDate.now().plusDays(4));
            order.setTrackingNumber("EXP-DEMO1001");

            ShippingAddress address = new ShippingAddress();
            address.setId("addr-1");
            address.setName("Chandu Tammana");
            address.setPhone("+91 98765 43210");
            address.setStreet("12 Orchard Residency");
            address.setCity("Hyderabad");
            address.setState("Telangana");
            address.setPincode("500001");
            address.setType("home");
            order.setShippingAddress(address);

            OrderItem item = new OrderItem();
            item.setId("item-1");
            item.setProductId("prod-almond-1");
            item.setVariantId("v-prod-almond-1-1");
            item.setName("Kashmiri Organic Mamra Almonds");
            item.setSlug("kashmiri-organic-mamra-almonds");
            item.setCategory("Almonds");
            item.setWeight("250g");
            item.setPrice(BigDecimal.valueOf(899));
            item.setMrp(BigDecimal.valueOf(1099));
            item.setQuantity(1);
            item.setSku("NN-ALM-MAM-250");
            order.setItems(List.of(item));
            order.setTimeline(List.of(step("Pending", true, false), step("Confirmed", true, true), step("Packed", false, false), step("Shipped", false, false), step("Delivered", false, false)));
            orderRepository.save(order);
        };
    }

    private OrderTimelineStep step(String status, boolean completed, boolean current) {
        OrderTimelineStep step = new OrderTimelineStep();
        step.setId("seed-step-" + status.toLowerCase());
        step.setStatus(status);
        step.setLabel(status);
        step.setDescription(status + " stage");
        step.setTimestamp(completed ? "Seeded" : null);
        step.setIsCompleted(completed);
        step.setIsCurrent(current);
        return step;
    }
}
