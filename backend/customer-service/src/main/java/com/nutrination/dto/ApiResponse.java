package com.nutrination.dto;

import java.time.Instant;

public record ApiResponse<T>(T data, String message, Instant timestamp) {
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(data, "success", Instant.now());
    }
}
