package com.nutrination.entity;

import jakarta.persistence.Embeddable;

@Embeddable
public class ShippingAddress {
    private String id;
    private String name;
    private String phone;
    private String street;
    private String landmark;
    private String city;
    private String state;
    private String pincode;
    private Boolean isDefault;
    private String type;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }
    public String getLandmark() { return landmark; }
    public void setLandmark(String landmark) { this.landmark = landmark; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }
    public Boolean getIsDefault() { return isDefault; }
    public void setIsDefault(Boolean aDefault) { isDefault = aDefault; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
