package com.wedding.invitation.platform.storage;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/** 로컬/테스트용 StorageClient. 샘플 키 목록과 의사 서명 URL 을 반환한다. 실제 클라우드 스토리지 대신 개발 환경에서 사용. */
@Component
@Profile({"local", "test", "default"})
public class LocalStorageClient implements StorageClient {

  @Override
  public List<String> listObjectKeys(String prefix) {
    // 개발용 샘플 이미지 키
    return List.of(prefix + "01.jpg", prefix + "02.jpg", prefix + "03.jpg");
  }

  @Override
  public String generateSignedUrl(String objectKey, Duration ttl) {
    long expires = Instant.now().plus(ttl).getEpochSecond();
    return "/local-assets/" + objectKey + "?expires=" + expires;
  }
}
