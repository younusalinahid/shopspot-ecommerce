package com.ecommerce.service;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/** Locks an email for a short time after repeated wrong passwords (stops password guessing). */
@Service
public class LoginAttemptService {

    private static final int MAX_FAILURES = 5;
    private static final Duration LOCK_TIME = Duration.ofMinutes(15);

    private record Attempts(int failures, Instant lockedUntil) {
    }

    private final Map<String, Attempts> attempts = new ConcurrentHashMap<>();

    private String key(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    public void checkNotLocked(String email) {
        Attempts a = attempts.get(key(email));
        if (a != null && a.lockedUntil() != null && Instant.now().isBefore(a.lockedUntil())) {
            long minutes = Math.max(1, Duration.between(Instant.now(), a.lockedUntil()).toMinutes());
            throw new RuntimeException("Too many failed login attempts. Try again in " + minutes + " minute(s).");
        }
    }

    public void loginFailed(String email) {
        attempts.compute(key(email), (k, a) -> {
            int failures = (a == null || (a.lockedUntil() != null && Instant.now().isAfter(a.lockedUntil())))
                    ? 1 : a.failures() + 1;
            Instant lockedUntil = failures >= MAX_FAILURES ? Instant.now().plus(LOCK_TIME) : null;
            return new Attempts(failures, lockedUntil);
        });
    }

    public void loginSucceeded(String email) {
        attempts.remove(key(email));
    }
}
