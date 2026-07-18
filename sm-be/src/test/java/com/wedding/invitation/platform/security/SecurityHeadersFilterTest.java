package com.wedding.invitation.platform.security;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

/** SecurityHeadersFilter 테스트 — 보안 헤더 주입 확인. */
class SecurityHeadersFilterTest {

  @Test
  void sets_security_headers() throws Exception {
    SecurityHeadersFilter filter = new SecurityHeadersFilter();
    MockHttpServletRequest request = new MockHttpServletRequest();
    MockHttpServletResponse response = new MockHttpServletResponse();
    FilterChain chain = (r, s) -> {};

    filter.doFilter(request, response, chain);

    assertThat(response.getHeader("X-Content-Type-Options")).isEqualTo("nosniff");
    assertThat(response.getHeader("X-Frame-Options")).isEqualTo("DENY");
    assertThat(response.getHeader("Content-Security-Policy")).contains("default-src 'self'");
    assertThat(response.getHeader("Strict-Transport-Security")).contains("max-age=");
  }
}
