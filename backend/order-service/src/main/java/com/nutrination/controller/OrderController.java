package com.nutrination.controller;

import com.nutrination.dto.ApiResponse;
import com.nutrination.dto.StatusUpdateRequest;
import com.nutrination.entity.CustomerOrder;
import com.nutrination.service.OrderService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ApiResponse<List<CustomerOrder>> all() {
        return ApiResponse.ok(orderService.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<CustomerOrder> one(@PathVariable String id) {
        return ApiResponse.ok(orderService.findByIdOrNumber(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CustomerOrder> create(@Valid @RequestBody CustomerOrder order) {
        return ApiResponse.ok(orderService.create(order));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<CustomerOrder> updateStatus(@PathVariable String id, @RequestBody StatusUpdateRequest request) {
        return ApiResponse.ok(orderService.updateStatus(id, request.status()));
    }
}
