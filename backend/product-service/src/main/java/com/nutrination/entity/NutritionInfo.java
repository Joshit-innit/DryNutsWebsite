package com.nutrination.entity;

import jakarta.persistence.Embeddable;

@Embeddable
public class NutritionInfo {
    private String servingSize;
    private String calories;
    private String protein;
    private String healthyFats;
    private String carbs;
    private String fiber;
    private String calcium;
    private String iron;
    private String potassium;
    private String magnesium;

    public String getServingSize() { return servingSize; }
    public void setServingSize(String servingSize) { this.servingSize = servingSize; }
    public String getCalories() { return calories; }
    public void setCalories(String calories) { this.calories = calories; }
    public String getProtein() { return protein; }
    public void setProtein(String protein) { this.protein = protein; }
    public String getHealthyFats() { return healthyFats; }
    public void setHealthyFats(String healthyFats) { this.healthyFats = healthyFats; }
    public String getCarbs() { return carbs; }
    public void setCarbs(String carbs) { this.carbs = carbs; }
    public String getFiber() { return fiber; }
    public void setFiber(String fiber) { this.fiber = fiber; }
    public String getCalcium() { return calcium; }
    public void setCalcium(String calcium) { this.calcium = calcium; }
    public String getIron() { return iron; }
    public void setIron(String iron) { this.iron = iron; }
    public String getPotassium() { return potassium; }
    public void setPotassium(String potassium) { this.potassium = potassium; }
    public String getMagnesium() { return magnesium; }
    public void setMagnesium(String magnesium) { this.magnesium = magnesium; }
}
