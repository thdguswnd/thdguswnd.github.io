package com.wedding.invitation.platform.instagram;

import com.wedding.invitation.instagram.dto.InstagramItem;
import com.wedding.invitation.platform.secrets.SecretsProvider;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * Instagram Graph API 기반 클라이언트. wedding.instagram.mock=false 일 때 활성화.
 *
 * <p>회복성: Resilience4j @CircuitBreaker + @Retry, 실패 시 fallback(빈 목록). HTTP timeout 은
 * RestTemplate(RestTemplateConfig) 에 설정.
 */
@Component
@ConditionalOnProperty(name = "wedding.instagram.mock", havingValue = "false")
public class GraphApiInstagramClient implements InstagramClient {

  private static final Logger log = LoggerFactory.getLogger(GraphApiInstagramClient.class);
  private static final String ENDPOINT =
      "https://graph.instagram.com/me/media?fields=media_url,permalink,caption&limit={limit}&access_token={token}";

  private final RestTemplate restTemplate;
  private final SecretsProvider secretsProvider;

  public GraphApiInstagramClient(RestTemplate restTemplate, SecretsProvider secretsProvider) {
    this.restTemplate = restTemplate;
    this.secretsProvider = secretsProvider;
  }

  @Override
  @CircuitBreaker(name = "instagram", fallbackMethod = "fallback")
  @Retry(name = "instagram")
  @SuppressWarnings("unchecked")
  public List<InstagramItem> fetchFeed(int limit) {
    String token = secretsProvider.getInstagramToken();
    Map<String, Object> response = restTemplate.getForObject(ENDPOINT, Map.class, limit, token);
    List<InstagramItem> items = new ArrayList<>();
    if (response != null && response.get("data") instanceof List<?> data) {
      for (Object o : data) {
        if (o instanceof Map<?, ?> m) {
          items.add(
              new InstagramItem(
                  str(m.get("media_url")), str(m.get("permalink")), str(m.get("caption"))));
        }
      }
    }
    return items;
  }

  private static String str(Object o) {
    return o == null ? null : o.toString();
  }

  /** Resilience4j fallback: 외부 호출 실패/회로 개방 시 빈 목록 반환(graceful degradation). */
  @SuppressWarnings("unused")
  private List<InstagramItem> fallback(int limit, Throwable t) {
    log.warn("Instagram Graph API 호출 실패, 폴백(빈 목록): {}", t.getMessage());
    return List.of();
  }
}
