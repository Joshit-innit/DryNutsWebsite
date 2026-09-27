package com.nutrination.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "order_timeline_steps")
public class OrderTimelineStep {
    @Id
    private String id;
    private String status;
    private String label;
    private String description;
    private String timestamp;
    private Boolean isCompleted = false;
    private Boolean isCurrent = false;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "order_id")
    private CustomerOrder order;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public Boolean getIsCompleted() { return isCompleted; }
    public void setIsCompleted(Boolean completed) { isCompleted = completed; }
    public Boolean getIsCurrent() { return isCurrent; }
    public void setIsCurrent(Boolean current) { isCurrent = current; }
    public CustomerOrder getOrder() { return order; }
    public void setOrder(CustomerOrder order) { this.order = order; }
}
