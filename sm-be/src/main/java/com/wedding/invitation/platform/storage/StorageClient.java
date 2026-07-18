package com.wedding.invitation.platform.storage;

import java.time.Duration;
import java.util.List;

/**
 * 오브젝트 스토리지 추상화. GCS/Azure Blob 구현으로 교체 가능(이식성 경계).
 *
 * <p>버킷은 비공개 유지, 접근은 만료형 서명 URL 로만 제공(SECURITY-09).
 */
public interface StorageClient {

  /**
   * 지정 prefix 하위 객체 키 목록을 반환한다.
   *
   * @param prefix 객체 키 prefix (예: "gallery/")
   * @return 객체 키 목록
   */
  List<String> listObjectKeys(String prefix);

  /**
   * 객체에 대한 만료형 서명 URL 을 발급한다.
   *
   * @param objectKey 객체 키
   * @param ttl 유효기간
   * @return 서명 URL 문자열
   */
  String generateSignedUrl(String objectKey, Duration ttl);
}
