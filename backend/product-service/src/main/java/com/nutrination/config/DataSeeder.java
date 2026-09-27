package com.nutrination.config;

import com.nutrination.entity.Category;
import com.nutrination.entity.NutritionInfo;
import com.nutrination.entity.Product;
import com.nutrination.entity.ProductVariant;
import com.nutrination.repository.CategoryRepository;
import com.nutrination.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seedCatalog(CategoryRepository categoryRepository, ProductRepository productRepository) {
        return args -> {
            if (categoryRepository.count() == 0) {
                categoryRepository.save(category("cat-1", "cashews", "Cashews", "Rich, creamy and naturally satisfying."));
                categoryRepository.save(category("cat-2", "pistachios", "Pistachios", "Vibrant emerald crunch with delicate salt."));
                categoryRepository.save(category("cat-3", "almonds", "Almonds", "Golden kernels brimming with natural vitamin E."));
                categoryRepository.save(category("cat-4", "raisins", "Raisins", "Naturally sun-cured sweet drops."));
                categoryRepository.save(category("cat-5", "combos", "Curated Combos", "Daily wellness blends and family packs."));
            }
            if (productRepository.count() == 0) {
                productRepository.save(product("prod-cashew-1", "royal-jumbo-cashews-w180", "Royal Jumbo Cashews W-180", "cashews", "Cashews", 449, 549, "250g", "NN-CSH-W180-250", true));
                productRepository.save(product("prod-almond-1", "kashmiri-organic-mamra-almonds", "Kashmiri Organic Mamra Almonds", "almonds", "Almonds", 899, 1099, "250g", "NN-ALM-MAM-250", true));
                productRepository.save(product("prod-pista-1", "california-lightly-salted-pista", "California Lightly Salted Pista", "pistachios", "Pistachios", 499, 599, "250g", "NN-PST-CAL-250", false));
                productRepository.save(product("prod-raisin-1", "seedless-green-raisins", "Seedless Green Raisins", "raisins", "Raisins", 199, 249, "250g", "NN-RSN-GRN-250", false));
                productRepository.save(product("prod-combo-1", "student-focus-trail-mix", "Student Focus Trail Mix", "combos", "Curated Combos", 349, 449, "250g Jar", "NN-CMB-STD-250", true));
            }
        };
    }

    private Category category(String id, String slug, String name, String tagline) {
        Category category = new Category();
        category.setId(id);
        category.setSlug(slug);
        category.setName(name);
        category.setTagline(tagline);
        category.setDescription(tagline + " Premium dry fruits packed fresh for everyday wellness.");
        category.setImage("https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=1000&q=80");
        category.setBannerImage(category.getImage());
        category.setOriginHighlight("India");
        category.setBenefits(List.of("Freshly packed", "Premium grade", "No artificial preservatives"));
        return category;
    }

    private Product product(String id, String slug, String name, String category, String categoryName, int price, int mrp, String weight, String sku, boolean bestSeller) {
        Product product = new Product();
        product.setId(id);
        product.setSlug(slug);
        product.setName(name);
        product.setCategory(category);
        product.setCategoryName(categoryName);
        product.setTagline("Premium " + categoryName.toLowerCase() + " harvest.");
        product.setShortDescription("Hand-selected " + name + " packed for clean daily snacking.");
        product.setDescription("A premium NutriNation harvest with natural crunch, rich taste, and careful hygienic packing.");
        product.setOrigin("India");
        product.setGrade("Premium Reserve");
        product.setImages(List.of("https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=1000&q=80"));
        product.setTags(List.of(categoryName, "Premium", "Dry Fruits"));
        product.setBenefits(List.of("Naturally nutrient dense", "Freshly packed", "No artificial colors"));
        product.setIngredients("100% " + name + ".");
        product.setStorageInfo("Store in a cool, dry place in an airtight container after opening.");
        product.setIsBestSeller(bestSeller);
        product.setIsFeatured(bestSeller);
        ProductVariant variant = new ProductVariant();
        variant.setId("v-" + id + "-1");
        variant.setWeight(weight);
        variant.setPrice(BigDecimal.valueOf(price));
        variant.setMrp(BigDecimal.valueOf(mrp));
        variant.setStock(50);
        variant.setSku(sku);
        product.setVariants(List.of(variant));
        NutritionInfo nutrition = new NutritionInfo();
        nutrition.setServingSize("30g");
        nutrition.setCalories("160 kcal");
        nutrition.setProtein("5g");
        nutrition.setHealthyFats("12g");
        nutrition.setCarbs("9g");
        nutrition.setFiber("2g");
        product.setNutrition(nutrition);
        return product;
    }
}
