package com.wedding.invitation.platform.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * 공개 엔드포인트(RSVP 제출) rate limiting 필터 (SECURITY-11).
 *
 * <p>IP 별 인메모리 버킷(Bucket4j). 인스턴스별 독립(소규모 허용). 초과 시 429.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class RateLimitFilter extends OncePerRequestFilter {

  private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();
  private final int perMinute;
  private final int perHour;

  public RateLimitFilter(
      @Value("${ratelimit.rsvp.per-minute:5}") int perMinute,
      @Value("${ratelimit.rsvp.per-hour:30}") int perHour) {
    this.perMinute = perMinute;
    this.perHour = perHour;
  }

  private Bucket newBucket() {
    Bandwidth minuteLimit =
        Bandwidth.classic(perMinute, Refill.greedy(perMinute, Duration.ofMinutes(1)));
    Bandwidth hourLimit = Bandwidth.classic(perHour, Refill.greedy(perHour, Duration.ofHours(1)));
    return Bucket.builder().addLimit(minuteLimit).addLimit(hourLimit).build();
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    // RSVP 제출(POST /api/rsvp)에만 적용
    return !("POST".equalsIgnoreCase(request.getMethod())
        && request.getRequestURI().startsWith("/api/rsvp"));
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String key = clientIp(request);
    Bucket bucket = buckets.computeIfAbsent(key, k -> newBucket());
    if (bucket.tryConsume(1)) {
      filterChain.doFilter(request, response);
    } else {
      response.setStatus(429); // Too Many Requests
      response.setContentType("application/json;charset=UTF-8");
      response
          .getWriter()
          .write("{\"success\":false,\"message\":\"요청이 너무 많습니다. 잠시 후 다시 시도해 주세요\"}");
    }
  }

  private String clientIp(HttpServletRequest request) {
    String forwarded = request.getHeader("X-Forwarded-For");
    if (forwarded != null && !forwarded.isBlank()) {
      return forwarded.split(",")[0].trim();
    }
    return request.getRemoteAddr();
  }
}
