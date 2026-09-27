package com.nutrination.controller;

import com.nutrination.dto.ApiResponse;
import com.nutrination.entity.Product;
import com.nutrination.service.ProductService;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ApiResponse<List<Product>> all(@RequestParam(required = false) String category,
                                          @RequestParam(required = false) BigDecimal maxPrice,
                                          @RequestParam(required = false) Double rating,
                                          @RequestParam(defaultValue = "false") boolean inStockOnly,
                                          @RequestParam(required = false) String search,
                                          @RequestParam(required = false) String sortBy) {
        return ApiResponse.ok(productService.findAll(category, maxPrice, rating, inStockOnly, search, sortBy));
    }

    @GetMapping("/{slug}")
    public ApiResponse<Product> one(@PathVariable String slug) {
        return ApiResponse.ok(productService.findBySlugOrId(slug));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Product> create(@Valid @RequestBody Product product) {
        return ApiResponse.ok(productService.create(product));
    }

    @PatchMapping("/{id}")
    public ApiResponse<Product> update(@PathVariable String id, @Valid @RequestBody Product product) {
        return ApiResponse.ok(productService.update(id, product));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        productService.delete(id);
        return ApiResponse.ok(null);
    }
}
