package com.nutrination.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** The ID token from Google's sign-in button. */
public record GoogleLoginRequest(@NotBlank @Size(max = 4096) String credential) {}
