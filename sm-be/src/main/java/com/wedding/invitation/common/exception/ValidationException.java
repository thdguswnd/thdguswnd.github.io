package com.wedding.invitation.common.exception;

/** 비즈니스 검증 실패 예외 (사용자 대면 일반화 메시지 대상). */
public class ValidationException extends RuntimeException {

  public ValidationException(String message) {
    super(message);
  }
}
