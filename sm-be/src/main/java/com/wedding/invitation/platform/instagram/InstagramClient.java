package com.wedding.invitation.platform.instagram;

import com.wedding.invitation.instagram.dto.InstagramItem;
import java.util.List;

/** Instagram 피드 조회 클라이언트 추상화. 회복성(timeout/CB/retry/fallback)은 구현에서 처리. */
public interface InstagramClient {

  /**
   * 최신 피드를 조회한다.
   *
   * @param limit 최대 개수
   * @return 피드 항목 (실패 시 빈 목록)
   */
  List<InstagramItem> fetchFeed(int limit);
}
