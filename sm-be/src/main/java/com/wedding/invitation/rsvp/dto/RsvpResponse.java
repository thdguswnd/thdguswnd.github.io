package com.wedding.invitation.rsvp.dto;

/** RSVP 접수 확인 응답 DTO. */
public class RsvpResponse {

  private boolean success;
  private String message;

  public RsvpResponse() {}

  public RsvpResponse(boolean success, String message) {
    this.success = success;
    this.message = message;
  }

  public static RsvpResponse ok() {
    return new RsvpResponse(true, "참석 의사가 정상적으로 접수되었습니다");
  }

  public boolean isSuccess() {
    return success;
  }

  public void setSuccess(boolean success) {
    this.success = success;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }
}
