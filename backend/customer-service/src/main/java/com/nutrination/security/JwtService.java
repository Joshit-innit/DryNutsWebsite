package com.nutrination.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private final ObjectMapper objectMapper;
    private final Clock clock;
    private final byte[] secret;
    private final Duration ttl;

    public JwtService(ObjectMapper objectMapper,
                      @Value("${security.jwt.secret}") String configuredSecret,
                      @Value("${security.jwt.ttl:PT15M}") Duration ttl) {
        if (configuredSecret == null || configuredSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET must be at least 32 characters and supplied outside source control");
        }
        this.objectMapper = objectMapper;
        this.clock = Clock.systemUTC();
        this.secret = configuredSecret.getBytes(StandardCharsets.UTF_8);
        this.ttl = ttl;
    }

    public String issue(CustomerTokenSubject subject) {
        try {
            Instant now = clock.instant();
            Map<String, Object> header = Map.of("alg", "HS256", "typ", "JWT");
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("iss", "nutrination-customer-service");
            payload.put("sub", subject.customerId());
            payload.put("email", subject.email());
            payload.put("role", subject.role());
            payload.put("iat", now.getEpochSecond());
            payload.put("exp", now.plus(ttl).getEpochSecond());
            String unsigned = encode(header) + "." + encode(payload);
            return unsigned + "." + sign(unsigned);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to issue access token", exception);
        }
    }

    public AuthenticatedUser parse(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3 || !MessageDigest.isEqual(sign(parts[0] + "." + parts[1]).getBytes(StandardCharsets.US_ASCII), parts[2].getBytes(StandardCharsets.US_ASCII))) {
                throw new IllegalArgumentException("Invalid token signature");
            }
            Map<String, Object> payload = objectMapper.readValue(decode(parts[1]), new TypeReference<>() {});
            long expiresAt = ((Number) payload.get("exp")).longValue();
            if (!"nutrination-customer-service".equals(payload.get("iss")) || clock.instant().getEpochSecond() >= expiresAt) {
                throw new IllegalArgumentException("Expired or invalid token");
            }
            return new AuthenticatedUser((String) payload.get("sub"), (String) payload.get("email"), (String) payload.get("role"));
        } catch (Exception exception) {
            throw new IllegalArgumentException("Invalid access token", exception);
        }
    }

    public long expiresInSeconds() {
        return ttl.toSeconds();
    }

    private String encode(Object value) throws Exception {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(objectMapper.writeValueAsBytes(value));
    }

    private byte[] decode(String value) {
        return Base64.getUrlDecoder().decode(value);
    }

    private String sign(String value) throws Exception {
        Mac mac = Mac.getInstance(HMAC_ALGORITHM);
        mac.init(new SecretKeySpec(secret, HMAC_ALGORITHM));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(value.getBytes(StandardCharsets.US_ASCII)));
    }

    public record CustomerTokenSubject(String customerId, String email, String role) {}
}
