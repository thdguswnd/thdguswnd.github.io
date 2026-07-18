package com.wedding.invitation.rsvp.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** 한국 휴대폰 번호 형식 검증 애노테이션 (BR-RSVP-02). */
@Documented
@Constraint(validatedBy = KoreanMobileValidator.class)
@Target({java.lang.annotation.ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface KoreanMobile {
  String message() default "유효한 휴대폰 번호 형식이 아닙니다";

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};
}
