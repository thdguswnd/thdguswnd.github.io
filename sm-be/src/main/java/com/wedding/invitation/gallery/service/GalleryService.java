package com.wedding.invitation.gallery.service;

import com.wedding.invitation.config.WeddingProperties;
import com.wedding.invitation.gallery.dto.GalleryItem;
import com.wedding.invitation.platform.storage.StorageClient;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

/**
 * 갤러리 서비스. 스토리지 객체를 파일명 기준 정렬 후 서명 URL 을 발급한다.
 *
 * <p>결과는 짧은 TTL(5분) 캐시(BR/NFR). 스토리지 오류 시 빈 목록으로 graceful degradation.
 */
@Service
public class GalleryService {

  private static final Logger log = LoggerFactory.getLogger(GalleryService.class);
  private static final String IMAGE_PREFIX = "gallery/";

  private final StorageClient storageClient;
  private final WeddingProperties properties;

  public GalleryService(StorageClient storageClient, WeddingProperties properties) {
    this.storageClient = storageClient;
    this.properties = properties;
  }

  /**
   * 갤러리 이미지 목록을 서명 URL 과 함께 반환한다.
   *
   * @return 정렬된 갤러리 항목 (실패 시 빈 목록)
   */
  @Cacheable("gallery")
  public List<GalleryItem> listImages() {
    try {
      List<String> keys = new ArrayList<>(storageClient.listObjectKeys(IMAGE_PREFIX));
      keys.sort(String::compareTo); // 파일명 기준 정렬 (BR-GAL-01)
      Duration ttl = Duration.ofMinutes(properties.getGallery().getSignedUrlTtlMinutes());
      List<GalleryItem> items = new ArrayList<>();
      int order = 0;
      for (String key : keys) {
        String url = storageClient.generateSignedUrl(key, ttl);
        items.add(new GalleryItem(url, order++));
      }
      return items;
    } catch (RuntimeException e) {
      log.warn("갤러리 조회 실패, 빈 목록 반환: {}", e.getMessage());
      return List.of();
    }
  }
}
