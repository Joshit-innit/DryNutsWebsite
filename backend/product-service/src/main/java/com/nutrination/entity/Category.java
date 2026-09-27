package com.nutrination.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categories")
public class Category {
    @Id
    private String id;
    @Column(unique = true, nullable = false)
    private String slug;
    private String name;
    private String tagline;
    @Column(length = 1800)
    private String description;
    @Column(length = 1000)
    private String image;
    @Column(length = 1000)
    private String bannerImage;
    private Integer itemCount = 0;
    private String originHighlight;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "category_benefits", joinColumns = @JoinColumn(name = "category_id"))
    @Column(name = "benefit", length = 500)
    private List<String> benefits = new ArrayList<>();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getTagline() { return tagline; }
    public void setTagline(String tagline) { this.tagline = tagline; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getBannerImage() { return bannerImage; }
    public void setBannerImage(String bannerImage) { this.bannerImage = bannerImage; }
    public Integer getItemCount() { return itemCount; }
    public void setItemCount(Integer itemCount) { this.itemCount = itemCount; }
    public String getOriginHighlight() { return originHighlight; }
    public void setOriginHighlight(String originHighlight) { this.originHighlight = originHighlight; }
    public List<String> getBenefits() { return benefits; }
    public void setBenefits(List<String> benefits) { this.benefits = benefits; }
}
