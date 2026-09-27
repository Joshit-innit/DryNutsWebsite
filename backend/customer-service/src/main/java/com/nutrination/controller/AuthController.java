package com.nutrination.controller;

import com.nutrination.dto.ApiResponse;
import com.nutrination.dto.LoginRequest;
import com.nutrination.entity.Customer;
import com.nutrination.service.CustomerService;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final CustomerService customerService;

    public AuthController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/check")
    public ApiResponse<Map<String, Object>> check() {
        return ApiResponse.ok(Map.of("authenticated", true, "role", "customer"));
    }

    @PostMapping("/login")
    public ApiResponse<Customer> login(@RequestBody LoginRequest request) {
        return ApiResponse.ok(customerService.findByEmail(request.email()));
    }

    @PostMapping("/admin-login")
    public ApiResponse<Map<String, Object>> adminLogin(@RequestBody LoginRequest request) {
        return ApiResponse.ok(Map.of(
                "authenticated", true,
                "token", "mock-admin-token",
                "email", request.email(),
                "role", "admin"
        ));
    }

    @PostMapping("/admin-logout")
    public ApiResponse<Map<String, Object>> adminLogout() {
        return ApiResponse.ok(Map.of("authenticated", false));
    }
}
