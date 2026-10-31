package com.ecommerce.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple per-IP rate limits for endpoints that can be abused without logging in
 * (password guessing, fake sign-ups, spam emails, paid AI calls).
 * In-memory fixed windows: fine for a single backend instance.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class RateLimitFilter extends OncePerRequestFilter {

    private record Rule(String method, String pathPrefix, int maxRequests, long windowMillis) {
    }

    private static final List<Rule> RULES = List.of(
            new Rule("POST", "/api/public/auth/login", 10, 60_000),
            new Rule("POST", "/api/public/auth/register", 5, 10 * 60_000),
            new Rule("POST", "/api/public/auth/refresh", 30, 60_000),
            new Rule("POST", "/api/public/report", 3, 10 * 60_000),
            new Rule("POST", "/api/public/chat", 20, 60_000),
            new Rule("POST", "/api/public/search/image", 10, 60_000),
            new Rule("POST", "/api/public/orders/guest/checkout", 10, 10 * 60_000)
    );

    private record Window(long startedAt, AtomicInteger count) {
    }

    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = request.getServletPath();
        for (Rule rule : RULES) {
            if (rule.method().equalsIgnoreCase(request.getMethod()) && path.startsWith(rule.pathPrefix())) {
                String key = rule.pathPrefix() + "|" + request.getRemoteAddr();
                long now = System.currentTimeMillis();
                Window window = windows.compute(key, (k, w) ->
                        (w == null || now - w.startedAt() >= rule.windowMillis())
                                ? new Window(now, new AtomicInteger()) : w);
                if (window.count().incrementAndGet() > rule.maxRequests()) {
                    long retryAfter = Math.max(1, (rule.windowMillis() - (now - window.startedAt())) / 1000);
                    response.setStatus(429);
                    response.setHeader("Retry-After", String.valueOf(retryAfter));
                    response.setContentType("application/json");
                    response.getWriter().write("{\"message\":\"Too many requests. Please try again in "
                            + retryAfter + " seconds.\"}");
                    return;
                }
                break;
            }
        }
        chain.doFilter(request, response);
    }

    /** Drop old windows so the map does not grow forever. */
    @Scheduled(fixedRate = 10 * 60_000)
    public void cleanUp() {
        long now = System.currentTimeMillis();
        windows.entrySet().removeIf(e -> now - e.getValue().startedAt() > 15 * 60_000);
    }
}
