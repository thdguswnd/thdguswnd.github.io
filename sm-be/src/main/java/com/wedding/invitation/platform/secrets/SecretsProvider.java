package com.wedding.invitation.platform.secrets;

/**
 * 시크릿 제공 추상화. 환경 변수 / Secret Manager / Key Vault 구현으로 교체 가능(SECURITY-12).
 *
 * <p>시크릿 값은 로그/응답에 노출하지 않는다.
 */
public interface SecretsProvider {

  /** Instagram Graph API 액세스 토큰. */
  String getInstagramToken();
}
