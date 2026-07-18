package com.wedding.invitation.platform.instagram;

import com.wedding.invitation.instagram.dto.InstagramItem;
import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/** 개발/로컬용 Mock Instagram 클라이언트. wedding.instagram.mock=true(기본)일 때 활성화. */
@Component
@ConditionalOnProperty(name = "wedding.instagram.mock", havingValue = "true", matchIfMissing = true)
public class MockInstagramClient implements InstagramClient {

  @Override
  public List<InstagramItem> fetchFeed(int limit) {
    List<InstagramItem> items = new ArrayList<>();
    for (int i = 1; i <= limit; i++) {
      items.add(
          new InstagramItem(
              "/local-assets/instagram/" + i + ".jpg",
              "https://instagram.com/p/sample" + i,
              "샘플 게시물 " + i));
    }
    return items;
  }
}
