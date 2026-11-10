package com.nutrination.security;

import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

/**
 * Checks the ID token Google's sign-in button hands the browser: signed by Google,
 * issued for this shop's client id, unexpired, and for a verified email address.
 * Only then is the person who Google says they are.
 */
@Component
public class GoogleTokenVerifier {
    private static final String GOOGLE_KEYS = "https://www.googleapis.com/oauth2/v3/certs";
    private static final Set<String> GOOGLE_ISSUERS = Set.of("accounts.google.com", "https://accounts.google.com");

    public record GoogleIdentity(String subject, String email, String name) {}

    private final String clientId;
    private final JwtDecoder decoder;

    public GoogleTokenVerifier(@Value("${google.client-id:}") String clientId) {
        this.clientId = clientId == null ? "" : clientId.trim();
        if (this.clientId.isEmpty()) {
            this.decoder = null;
            return;
        }
        NimbusJwtDecoder nimbus = NimbusJwtDecoder.withJwkSetUri(GOOGLE_KEYS).build();
        nimbus.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                new JwtTimestampValidator(),
                claim(jwt -> GOOGLE_ISSUERS.contains(String.valueOf(jwt.getClaims().get("iss"))), "Not issued by Google"),
                claim(jwt -> jwt.getAudience() != null && jwt.getAudience().contains(this.clientId), "Issued for another app")));
        this.decoder = nimbus;
    }

    public boolean isEnabled() {
        return decoder != null;
    }

    public GoogleIdentity verify(String credential) {
        if (decoder == null) {
            throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "Google sign-in is not set up");
        }
        Jwt jwt;
        try {
            jwt = decoder.decode(credential);
        } catch (JwtException invalid) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google sign-in could not be verified");
        }

        String email = jwt.getClaimAsString("email");
        if (email == null || email.isBlank() || !Boolean.TRUE.equals(jwt.getClaimAsBoolean("email_verified"))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Your Google account's email address isn't verified");
        }
        String name = jwt.getClaimAsString("name");
        return new GoogleIdentity(jwt.getSubject(), email, name == null || name.isBlank() ? email.split("@")[0] : name);
    }

    private static OAuth2TokenValidator<Jwt> claim(java.util.function.Predicate<Jwt> test, String reason) {
        OAuth2Error error = new OAuth2Error("invalid_token", reason, null);
        return jwt -> test.test(jwt) ? OAuth2TokenValidatorResult.success() : OAuth2TokenValidatorResult.failure(List.of(error));
    }
}
