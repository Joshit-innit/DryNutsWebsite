package com.nutrination.security;

public record AuthenticatedUser(String customerId, String email, String role) {
    public boolean isAdmin() {
        return "ADMIN".equals(role);
    }
}
