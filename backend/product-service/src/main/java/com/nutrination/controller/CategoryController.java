package com.nutrination.controller;

import com.nutrination.dto.ApiResponse;
import com.nutrination.entity.Category;
import com.nutrination.service.CategoryService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ApiResponse<List<Category>> all() {
        return ApiResponse.ok(categoryService.findAll());
    }
}
