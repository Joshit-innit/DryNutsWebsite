package com.nutrination.service;

import com.nutrination.entity.Product;
import com.nutrination.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<Product> findAll(String category, BigDecimal maxPrice, Double rating, boolean inStockOnly, String search, String sortBy) {
        return productRepository.findByStatusNot("archived").stream()
                .filter(product -> category == null || category.equals("all") || category.equals(product.getCategory()))
                .filter(product -> maxPrice == null || lowestPrice(product).compareTo(maxPrice) <= 0)
                .filter(product -> rating == null || product.getRating() >= rating)
                .filter(product -> !inStockOnly || product.getVariants().stream().anyMatch(v -> v.getStock() != null && v.getStock() > 0))
                .filter(product -> search == null || product.getName().toLowerCase(Locale.ROOT).contains(search.toLowerCase(Locale.ROOT)))
                .sorted(sorter(sortBy))
                .toList();
    }

    @Transactional(readOnly = true)
    public Product findBySlugOrId(String slugOrId) {
        return productRepository.findBySlug(slugOrId)
                .or(() -> productRepository.findById(slugOrId))
                .orElseThrow(() -> new EntityNotFoundException("Product not found: " + slugOrId));
    }

    @Transactional
    public Product create(Product product) {
        if (product.getId() == null || product.getId().isBlank()) {
            product.setId("prod-" + System.currentTimeMillis());
        }
        if (product.getSlug() == null || product.getSlug().isBlank()) {
            product.setSlug(slugify(product.getName()));
        }
        product.syncVariants();
        return productRepository.save(product);
    }

    @Transactional
    public Product update(String id, Product updates) {
        Product existing = findBySlugOrId(id);
        updates.setId(existing.getId());
        updates.setSlug(updates.getSlug() == null || updates.getSlug().isBlank() ? existing.getSlug() : updates.getSlug());
        updates.syncVariants();
        return productRepository.save(updates);
    }

    @Transactional
    public void delete(String id) {
        productRepository.delete(findBySlugOrId(id));
    }

    private BigDecimal lowestPrice(Product product) {
        return product.getVariants().stream()
                .map(v -> v.getPrice() == null ? BigDecimal.ZERO : v.getPrice())
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
    }

    private Comparator<Product> sorter(String sortBy) {
        return switch (sortBy == null ? "popularity" : sortBy) {
            case "price-asc" -> Comparator.comparing(this::lowestPrice);
            case "price-desc" -> Comparator.comparing(this::lowestPrice).reversed();
            case "rating" -> Comparator.comparing(Product::getRating).reversed();
            case "newest" -> Comparator.comparing(Product::getIsNew).reversed();
            default -> Comparator.comparing(Product::getIsBestSeller).reversed().thenComparing(Product::getReviewCount).reversed();
        };
    }

    private String slugify(String text) {
        String normalized = Normalizer.normalize(text == null ? "product" : text, Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }
}
