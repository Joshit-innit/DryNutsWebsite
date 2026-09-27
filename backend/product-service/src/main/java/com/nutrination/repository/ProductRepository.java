package com.nutrination.repository;

import com.nutrination.entity.Product;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, String> {
    Optional<Product> findBySlug(String slug);
    List<Product> findByCategory(String category);
    List<Product> findByStatusNot(String status);
}
