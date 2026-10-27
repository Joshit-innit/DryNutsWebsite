package com.nutrination.client;

import com.nutrination.dto.ApiResponse;
import java.util.Map;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "customer-service")
public interface CustomerClient {
    @GetMapping("/api/v1/customers/{id}")
    ApiResponse<Map<String, Object>> getCustomer(@PathVariable("id") String id);
}
