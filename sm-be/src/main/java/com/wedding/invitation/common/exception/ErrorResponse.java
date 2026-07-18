package com.wedding.invitation.common.exception;

/** 사용자 대면 일반화 오류 응답 DTO. 내부 상세/스택은 포함하지 않는다(SECURITY-15). */
public class ErrorResponse {

  private boolean success = false;
  private String message;

  public ErrorResponse() {}

  public ErrorResponse(String message) {
    this.message = message;
  }

  public boolean isSuccess() {
    return success;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }
}
