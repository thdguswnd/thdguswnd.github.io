package com.wedding.invitation.rsvp.validation;

import com.wedding.invitation.common.util.ContactNormalizer;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

/** 한국 휴대폰 번호 형식 검증기. 정규화 후 010/011/016/017/018/019-XXX(X)-XXXX 패턴을 허용. */
public class KoreanMobileValidator implements ConstraintValidator<KoreanMobile, String> {

  private static final Pattern PATTERN = Pattern.compile("^01[016789]-\\d{3,4}-\\d{4}$");

  @Override
  public boolean isValid(String value, ConstraintValidatorContext context) {
    if (value == null || value.isBlank()) {
      return true; // 선택 입력: 공백이면 통과. 값이 있으면 형식 검증
    }
    String normalized = ContactNormalizer.normalize(value);
    return PATTERN.matcher(normalized).matches();
  }
}
