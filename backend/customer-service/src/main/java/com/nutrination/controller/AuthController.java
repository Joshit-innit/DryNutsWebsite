package com.nutrination.controller;

import com.nutrination.dto.ApiResponse;
import com.nutrination.dto.AuthResponse;
import com.nutrination.dto.LoginRequest;
import com.nutrination.dto.RegisterRequest;
import com.nutrination.entity.Customer;
import com.nutrination.security.AuthenticatedUser;
import com.nutrination.security.JwtService;
import com.nutrination.service.CustomerService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final CustomerService customerService;
    private final JwtService jwtService;

    public AuthController(CustomerService customerService, JwtService jwtService) {
        this.customerService = customerService;
        this.jwtService = jwtService;
    }

    @GetMapping("/check")
    public ApiResponse<Map<String, Object>> check(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser user)) {
            return ApiResponse.ok(Map.of("authenticated", false));
        }
        return ApiResponse.ok(Map.of("authenticated", true, "customerId", user.customerId(), "role", user.role()));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(authenticate(request, false));
    }

    @PostMapping("/admin-login")
    public ApiResponse<AuthResponse> adminLogin(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(authenticate(request, true));
    }

    @PostMapping("/admin-logout")
    public ApiResponse<Map<String, Object>> adminLogout() {
        return ApiResponse.ok(Map.of("authenticated", false));
    }

    @PostMapping("/register")
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        Customer customer = customerService.register(request.name(), request.email(), request.password());
        return ApiResponse.ok(tokenFor(customer));
    }

    private AuthResponse authenticate(LoginRequest request, boolean requireAdmin) {
        Customer customer = customerService.authenticate(request.email(), request.password());
        String role = customer.getRole() == null ? "CUSTOMER" : customer.getRole().toUpperCase();
        if (requireAdmin && !"ADMIN".equals(role)) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN, "Administrator access is required");
        }
        return tokenFor(customer);
    }

    private AuthResponse tokenFor(Customer customer) {
        String role = customer.getRole() == null ? "CUSTOMER" : customer.getRole().toUpperCase();
        String token = jwtService.issue(new JwtService.CustomerTokenSubject(customer.getId(), customer.getEmail(), role));
        return new AuthResponse(token, "Bearer", jwtService.expiresInSeconds(), customer.getId(), role);
    }
}
