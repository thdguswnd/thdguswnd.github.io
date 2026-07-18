package com.wedding.invitation.common.util;

/**
 * 연락처(휴대폰) 정규화 유틸. 순수 함수 — PBT 대상(P-02 멱등성).
 *
 * <p>숫자만 추출하여 010-XXXX-XXXX 형태로 표준화한다. 정규화 불가한 값은 원본을 트림하여 반환한다.
 */
public final class ContactNormalizer {

  private ContactNormalizer() {}

  /**
   * 휴대폰 번호를 표준 형식으로 정규화한다.
   *
   * @param raw 사용자 입력 연락처
   * @return 정규화된 연락처 (예: 010-1234-5678)
   */
  public static String normalize(String raw) {
    if (raw == null) {
      return null;
    }
    String digits = raw.replaceAll("[^0-9]", "");
    // 11자리(010XXXXXXXX)
    if (digits.length() == 11) {
      return digits.substring(0, 3) + "-" + digits.substring(3, 7) + "-" + digits.substring(7);
    }
    // 10자리(01XXXXXXXX): 3-3-4
    if (digits.length() == 10) {
      return digits.substring(0, 3) + "-" + digits.substring(3, 6) + "-" + digits.substring(6);
    }
    return raw.trim();
  }
}
