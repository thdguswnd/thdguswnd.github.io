package com.wedding.invitation.platform.storage;

import com.wedding.invitation.config.WeddingProperties;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * GCS StorageClient (gcp 프로파일) — 골격.
 *
 * <p>NOTE: azure 프로파일의 실제 구현은 {@link AzureBlobStorageClient} 를 사용한다. 이 클래스는 GCP 이전 시 GCS V4 signed
 * URL 로 대체해야 하는 통합 지점(골격)이다. 운영 배포 전 GCS SDK 서명 로직으로 교체한다.
 */
@Component
@Profile("gcp")
public class CloudStorageClient implements StorageClient {

  private final WeddingProperties properties;

  public CloudStorageClient(WeddingProperties properties) {
    this.properties = properties;
  }

  @Override
  public List<String> listObjectKeys(String prefix) {
    // TODO(prod): GCS SDK 로 실제 객체 나열. GCP 이전 시 구현.
    return List.of();
  }

  @Override
  public String generateSignedUrl(String objectKey, Duration ttl) {
    // TODO(prod): GCS V4 signed URL 로 대체. GCP 이전 시 구현. 아래는 골격.
    long expires = Instant.now().plus(ttl).getEpochSecond();
    String bucket = properties.getStorage().getBucket();
    return "https://storage.example/" + bucket + "/" + objectKey + "?expires=" + expires;
  }
}
