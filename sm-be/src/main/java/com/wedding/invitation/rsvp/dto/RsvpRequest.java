package com.wedding.invitation.rsvp.dto;

import com.wedding.invitation.rsvp.domain.Attendance;
import com.wedding.invitation.rsvp.domain.MealOption;
import com.wedding.invitation.rsvp.domain.Side;
import com.wedding.invitation.rsvp.validation.KoreanMobile;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

// 연락처는 선택 입력. 값이 있을 때만 형식 검증(KoreanMobileValidator).

/**
 * RSVP 제출 요청 DTO.
 *
 * <p>필드 단위 검증은 애노테이션으로, 조건부(참석/불참) 규칙은 RsvpService 에서 수행(BR-RSVP-05/06).
 */
public class RsvpRequest {

  @NotBlank(message = "이름은 필수입니다")
  @Size(max = 50, message = "이름은 50자 이하여야 합니다")
  private String name;

  @KoreanMobile private String contact;

  @NotNull(message = "신랑측/신부측 구분은 필수입니다")
  private Side side;

  @NotNull(message = "참석 여부는 필수입니다")
  private Attendance attendance;

  private Integer adultCount;
  private Integer childCount;
  private MealOption mealOption;
  private Boolean privacyConsent;

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getContact() {
    return contact;
  }

  public void setContact(String contact) {
    this.contact = contact;
  }

  public Side getSide() {
    return side;
  }

  public void setSide(Side side) {
    this.side = side;
  }

  public Attendance getAttendance() {
    return attendance;
  }

  public void setAttendance(Attendance attendance) {
    this.attendance = attendance;
  }

  public Integer getAdultCount() {
    return adultCount;
  }

  public void setAdultCount(Integer adultCount) {
    this.adultCount = adultCount;
  }

  public Integer getChildCount() {
    return childCount;
  }

  public void setChildCount(Integer childCount) {
    this.childCount = childCount;
  }

  public MealOption getMealOption() {
    return mealOption;
  }

  public void setMealOption(MealOption mealOption) {
    this.mealOption = mealOption;
  }

  public Boolean getPrivacyConsent() {
    return privacyConsent;
  }

  public void setPrivacyConsent(Boolean privacyConsent) {
    this.privacyConsent = privacyConsent;
  }
}
