package com.wedding.invitation.platform.secrets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * 환경 변수/설정 기반 SecretsProvider 기본 구현.
 *
 * <p>운영에서는 GCP Secret Manager / Azure Key Vault 연동 구현으로 교체(이식성 경계). 값은 환경 변수 INSTAGRAM_TOKEN 또는 설정
 * wedding.instagram.token 에서 로드.
 */
@Component
public class EnvSecretsProvider implements SecretsProvider {

  private final String instagramToken;

  public EnvSecretsProvider(
      @Value("${wedding.instagram.token:${INSTAGRAM_TOKEN:}}") String instagramToken) {
    this.instagramToken = instagramToken;
  }

  @Override
  public String getInstagramToken() {
    return instagramToken;
  }
}
