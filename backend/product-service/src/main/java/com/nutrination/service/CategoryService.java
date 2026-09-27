package com.nutrination.service;

import com.nutrination.entity.Category;
import com.nutrination.repository.CategoryRepository;
import com.nutrination.repository.ProductRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<Category> findAll() {
        return categoryRepository.findAll().stream()
                .peek(category -> category.setItemCount(productRepository.findByCategory(category.getSlug()).size()))
                .toList();
    }
}
