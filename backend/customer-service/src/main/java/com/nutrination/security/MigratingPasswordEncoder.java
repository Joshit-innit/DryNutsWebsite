package com.nutrination.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import org.bouncycastle.crypto.generators.SCrypt;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * BCrypt for everything new, plus read-only support for the scrypt hashes written by
 * the Next.js API (format {@code scrypt$<salt>$<hash>}, Node's default N=16384, r=8, p=1).
 * Those accounts keep their passwords and are rehashed with BCrypt when they next sign in.
 */
public class MigratingPasswordEncoder implements PasswordEncoder {
    private static final String LEGACY_PREFIX = "scrypt$";
    private static final int N = 16384;
    private static final int R = 8;
    private static final int P = 1;

    private final PasswordEncoder current;

    public MigratingPasswordEncoder(PasswordEncoder current) {
        this.current = current;
    }

    @Override
    public String encode(CharSequence rawPassword) {
        return current.encode(rawPassword);
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        if (encodedPassword != null && encodedPassword.startsWith(LEGACY_PREFIX)) {
            return matchesScrypt(rawPassword, encodedPassword);
        }
        return current.matches(rawPassword, encodedPassword);
    }

    @Override
    public boolean upgradeEncoding(String encodedPassword) {
        return encodedPassword != null && encodedPassword.startsWith(LEGACY_PREFIX);
    }

    private boolean matchesScrypt(CharSequence rawPassword, String stored) {
        String[] parts = stored.split("\\$");
        if (parts.length != 3) {
            return false;
        }
        try {
            byte[] salt = Base64.getDecoder().decode(parts[1]);
            byte[] expected = Base64.getDecoder().decode(parts[2]);
            byte[] password = rawPassword.toString().getBytes(StandardCharsets.UTF_8);
            return MessageDigest.isEqual(expected, SCrypt.generate(password, salt, N, R, P, expected.length));
        } catch (IllegalArgumentException malformedHash) {
            return false;
        }
    }
}
