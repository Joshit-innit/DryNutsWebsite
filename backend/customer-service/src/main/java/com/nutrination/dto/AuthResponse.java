package com.nutrination.dto;

public record AuthResponse(String accessToken, String tokenType, long expiresIn, String customerId, String role) {}
