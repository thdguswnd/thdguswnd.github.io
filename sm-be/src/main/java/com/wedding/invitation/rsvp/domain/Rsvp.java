package com.wedding.invitation.rsvp.domain;

import java.time.Instant;
import java.util.Objects;

/**
 * RSVP(참석 의사) 도메인 엔티티.
 *
 * <p>불참(NOT_ATTENDING)인 경우 adultCount/childCount/mealOption 은 null 로 저장된다(BR-RSVP-06).
 */
public class Rsvp {

  private Long id;
  private String name;
  private String contact; // 정규화된 휴대폰 번호, upsert 키
  private Side side;
  private Attendance attendance;
  private Integer adultCount; // 식사함 선택 시 대인 인원(0~)
  private Integer childCount; // 식사함 선택 시 소인 인원(6~12세, 0~)
  private MealOption mealOption;
  private Boolean privacyConsent; // 개인정보 수집·이용 동의 여부
  private Instant createdAt;
  private Instant updatedAt;

  public Rsvp() {}

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

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

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Instant updatedAt) {
    this.updatedAt = updatedAt;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (!(o instanceof Rsvp other)) {
      return false;
    }
    return Objects.equals(name, other.name)
        && Objects.equals(contact, other.contact)
        && side == other.side
        && attendance == other.attendance
        && Objects.equals(adultCount, other.adultCount)
        && Objects.equals(childCount, other.childCount)
        && mealOption == other.mealOption
        && Objects.equals(privacyConsent, other.privacyConsent);
  }

  @Override
  public int hashCode() {
    return Objects.hash(
        name, contact, side, attendance, adultCount, childCount, mealOption, privacyConsent);
  }
}
