package com.nutrination.security;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import org.springframework.stereotype.Component;

/**
 * Locks an email address out of password checks for a while after repeated failures,
 * so a password can't be guessed by trying thousands of them. Counted here as well as
 * on the website because this service can be called directly.
 *
 * In memory is enough: the service runs as one instance, and a restart only forgives
 * failures early.
 */
@Component
public class LoginAttemptLimiter {
    static final int MAX_FAILURES = 10;
    static final Duration WINDOW = Duration.ofMinutes(15);
    private static final int MAX_TRACKED = 50_000;

    private record Failures(int count, Instant windowStart) {}

    private final ConcurrentMap<String, Failures> failures = new ConcurrentHashMap<>();
    private final Clock clock;

    public LoginAttemptLimiter() {
        this(Clock.systemUTC());
    }

    LoginAttemptLimiter(Clock clock) {
        this.clock = clock;
    }

    public boolean isLocked(String email) {
        Failures current = failures.get(key(email));
        return current != null && !expired(current) && current.count() >= MAX_FAILURES;
    }

    public void recordFailure(String email) {
        if (failures.size() > MAX_TRACKED) {
            failures.values().removeIf(this::expired);
        }
        failures.merge(key(email), new Failures(1, clock.instant()),
                (old, fresh) -> expired(old) ? fresh : new Failures(old.count() + 1, old.windowStart()));
    }

    public void recordSuccess(String email) {
        failures.remove(key(email));
    }

    public long retryAfterSeconds() {
        return WINDOW.toSeconds();
    }

    private boolean expired(Failures entry) {
        return entry.windowStart().plus(WINDOW).isBefore(clock.instant());
    }

    private static String key(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }
}
