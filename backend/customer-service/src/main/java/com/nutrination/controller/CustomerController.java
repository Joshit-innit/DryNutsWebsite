package com.nutrination.controller;

import com.nutrination.dto.ApiResponse;
import com.nutrination.entity.Customer;
import com.nutrination.service.CustomerService;
import com.nutrination.security.AuthenticatedUser;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {
    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<Customer>> all() {
        return ApiResponse.ok(customerService.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<Customer> one(@PathVariable String id, Authentication authentication) {
        verifyOwnerOrAdmin(id, authentication);
        return ApiResponse.ok(customerService.findById(id));
    }

    @GetMapping("/lookup")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Customer> byEmail(@RequestParam String email) {
        return ApiResponse.ok(customerService.findByEmail(email));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Customer> create(@Valid @RequestBody Customer customer) {
        return ApiResponse.ok(customerService.save(customer));
    }

    private void verifyOwnerOrAdmin(String customerId, Authentication authentication) {
        if (!(authentication.getPrincipal() instanceof AuthenticatedUser user)
                || (!user.isAdmin() && !user.customerId().equals(customerId))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this customer record");
        }
    }
}
