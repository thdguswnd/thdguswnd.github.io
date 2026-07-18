package com.wedding.invitation.instagram.service;

import com.wedding.invitation.config.WeddingProperties;
import com.wedding.invitation.instagram.dto.InstagramItem;
import com.wedding.invitation.platform.instagram.InstagramClient;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

/**
 * Instagram 피드 서비스. 서버 측 토큰 기반 프록시(InstagramClient) 결과를 최신 N개로 제한.
 *
 * <p>결과는 캐시(10분). 클라이언트 회복성(timeout/CB/retry/fallback)은 InstagramClient 에서 처리.
 */
@Service
public class InstagramService {

  private static final Logger log = LoggerFactory.getLogger(InstagramService.class);

  private final InstagramClient client;
  private final WeddingProperties properties;

  public InstagramService(InstagramClient client, WeddingProperties properties) {
    this.client = client;
    this.properties = properties;
  }

  /**
   * 최신 Instagram 피드를 조회한다. 실패 시 빈 목록(폴백).
   *
   * @return 최신 피드 항목(최대 feedLimit)
   */
  @Cacheable("instagram")
  public List<InstagramItem> getFeed() {
    int limit = properties.getInstagram().getFeedLimit();
    List<InstagramItem> feed = client.fetchFeed(limit);
    if (feed == null || feed.isEmpty()) {
      log.info("Instagram 피드가 비어 있음(폴백). 프론트는 프로필 링크로 대체");
      return List.of();
    }
    return feed.stream().limit(limit).collect(Collectors.toList());
  }
}
