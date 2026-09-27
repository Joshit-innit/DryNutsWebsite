package com.nutrination.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

@Entity
@Table(name = "product_variants")
public class ProductVariant {
    @Id
    private String id;
    @NotBlank
    private String weight;
    @Min(0)
    private BigDecimal price;
    @Min(0)
    private BigDecimal mrp;
    @Min(0)
    private Integer stock;
    @NotBlank
    private String sku;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getWeight() { return weight; }
    public void setWeight(String weight) { this.weight = weight; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public BigDecimal getMrp() { return mrp; }
    public void setMrp(BigDecimal mrp) { this.mrp = mrp; }
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
}
