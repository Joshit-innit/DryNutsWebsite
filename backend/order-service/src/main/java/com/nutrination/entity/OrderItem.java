package com.nutrination.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    private String id;
    private String productId;
    private String variantId;
    private String name;
    private String slug;
    private String category;
    private String weight;
    private BigDecimal price;
    private BigDecimal mrp;
    private String image;
    private Integer quantity;
    private String sku;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "order_id")
    private CustomerOrder order;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public String getVariantId() { return variantId; }
    public void setVariantId(String variantId) { this.variantId = variantId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getWeight() { return weight; }
    public void setWeight(String weight) { this.weight = weight; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public BigDecimal getMrp() { return mrp; }
    public void setMrp(BigDecimal mrp) { this.mrp = mrp; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public CustomerOrder getOrder() { return order; }
    public void setOrder(CustomerOrder order) { this.order = order; }
}
