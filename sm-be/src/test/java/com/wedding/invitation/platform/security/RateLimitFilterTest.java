package com.wedding.invitation.platform.security;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

/** RateLimitFilter 테스트 — 한도 초과 시 429. */
class RateLimitFilterTest {

  private MockHttpServletRequest rsvpRequest(String ip) {
    MockHttpServletRequest req = new MockHttpServletRequest();
    req.setMethod("POST");
    req.setRequestURI("/api/rsvp");
    req.setRemoteAddr(ip);
    return req;
  }

  @Test
  void allows_up_to_limit_then_blocks() throws Exception {
    RateLimitFilter filter = new RateLimitFilter(2, 30);
    FilterChain chain = (r, s) -> {};

    MockHttpServletResponse r1 = new MockHttpServletResponse();
    filter.doFilter(rsvpRequest("1.1.1.1"), r1, chain);
    assertThat(r1.getStatus()).isEqualTo(200);

    MockHttpServletResponse r2 = new MockHttpServletResponse();
    filter.doFilter(rsvpRequest("1.1.1.1"), r2, chain);
    assertThat(r2.getStatus()).isEqualTo(200);

    MockHttpServletResponse r3 = new MockHttpServletResponse();
    filter.doFilter(rsvpRequest("1.1.1.1"), r3, chain);
    assertThat(r3.getStatus()).isEqualTo(429);
  }

  @Test
  void different_ips_have_independent_limits() throws Exception {
    RateLimitFilter filter = new RateLimitFilter(1, 30);
    FilterChain chain = (r, s) -> {};

    MockHttpServletResponse a = new MockHttpServletResponse();
    filter.doFilter(rsvpRequest("2.2.2.2"), a, chain);
    assertThat(a.getStatus()).isEqualTo(200);

    MockHttpServletResponse b = new MockHttpServletResponse();
    filter.doFilter(rsvpRequest("3.3.3.3"), b, chain);
    assertThat(b.getStatus()).isEqualTo(200);
  }
}
