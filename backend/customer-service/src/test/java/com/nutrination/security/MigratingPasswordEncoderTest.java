package com.nutrination.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class MigratingPasswordEncoderTest {
    /** Written by Node's crypto.scryptSync, the way frontend/src/lib/server/auth.ts did. */
    private static final String NODE_HASH = "scrypt$c49MUjPRtIe8fhM2qem7sA==$NXHSufUWV51pAge8+8qk8vc6BMzPeUXqabxfMJ9QCnPqYA4lQg6h2LeP3lp+DbzSHMJqFK7p+dZwk/LGr53KDg==";

    private final MigratingPasswordEncoder encoder = new MigratingPasswordEncoder(new BCryptPasswordEncoder(4));

    @Test
    void acceptsTheRightPasswordForAHashWrittenByNode() {
        assertTrue(encoder.matches("correct horse battery", NODE_HASH));
    }

    @Test
    void rejectsTheWrongPasswordForAHashWrittenByNode() {
        assertFalse(encoder.matches("wrong password", NODE_HASH));
    }

    @Test
    void rejectsAMalformedLegacyHash() {
        assertFalse(encoder.matches("anything", "scrypt$not-enough-parts"));
        assertFalse(encoder.matches("anything", "scrypt$%%%$%%%"));
    }

    @Test
    void onlyLegacyHashesNeedUpgrading() {
        assertTrue(encoder.upgradeEncoding(NODE_HASH));
        assertFalse(encoder.upgradeEncoding(encoder.encode("a new password")));
    }

    @Test
    void newPasswordsStillVerify() {
        assertTrue(encoder.matches("a new password", encoder.encode("a new password")));
    }
}
