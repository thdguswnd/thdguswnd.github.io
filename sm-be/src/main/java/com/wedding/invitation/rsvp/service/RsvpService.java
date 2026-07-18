package com.wedding.invitation.rsvp.service;

import com.wedding.invitation.common.exception.ValidationException;
import com.wedding.invitation.common.util.ContactNormalizer;
import com.wedding.invitation.rsvp.domain.Attendance;
import com.wedding.invitation.rsvp.domain.Rsvp;
import com.wedding.invitation.rsvp.dto.RsvpRequest;
import com.wedding.invitation.rsvp.repository.RsvpRepository;
import java.time.Instant;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * RSVP 접수 도메인 서비스.
 *
 * <p>검증(조건부 규칙) → 연락처 정규화 → upsert(연락처 기준) 오케스트레이션. (business-logic-model.md 1)
 */
@Service
public class RsvpService {

  static final int COUNT_MIN = 0;
  static final int COUNT_MAX = 20;

  private final RsvpRepository repository;

  public RsvpService(RsvpRepository repository) {
    this.repository = repository;
  }

  /**
   * RSVP 를 접수(신규 저장 또는 연락처 기준 갱신)한다.
   *
   * @param request 제출 요청
   */
  @Transactional
  public void register(RsvpRequest request) {
    Rsvp normalized = validateAndBuild(request);

    Instant now = Instant.now();
    // 연락처가 있으면 연락처 기준 upsert, 없으면 신규 insert
    Optional<Rsvp> existing =
        normalized.getContact() == null
            ? Optional.empty()
            : repository.findByContact(normalized.getContact());
    if (existing.isPresent()) {
      Rsvp toUpdate = existing.get();
      toUpdate.setName(normalized.getName());
      toUpdate.setSide(normalized.getSide());
      toUpdate.setAttendance(normalized.getAttendance());
      toUpdate.setAdultCount(normalized.getAdultCount());
      toUpdate.setChildCount(normalized.getChildCount());
      toUpdate.setMealOption(normalized.getMealOption());
      toUpdate.setPrivacyConsent(normalized.getPrivacyConsent());
      toUpdate.setUpdatedAt(now);
      repository.update(toUpdate);
    } else {
      normalized.setCreatedAt(now);
      normalized.setUpdatedAt(now);
      repository.insert(normalized);
    }
  }

  /**
   * 요청을 검증하고 정규화된 도메인 엔티티로 변환한다. 순수 로직(저장소 미접근) — PBT 대상(P-01/P-04).
   *
   * @param request 제출 요청
   * @return 정규화된 Rsvp (불참 시 인원/식사 필드 null)
   */
  public Rsvp validateAndBuild(RsvpRequest request) {
    if (request == null) {
      throw new ValidationException("요청이 비어 있습니다");
    }
    if (request.getName() == null || request.getName().isBlank()) {
      throw new ValidationException("이름은 필수입니다");
    }
    if (request.getName().trim().length() > 50) {
      throw new ValidationException("이름은 50자 이하여야 합니다");
    }
    if (request.getSide() == null) {
      throw new ValidationException("신랑측/신부측 구분은 필수입니다");
    }
    if (request.getAttendance() == null) {
      throw new ValidationException("참석 여부는 필수입니다");
    }

    Rsvp rsvp = new Rsvp();
    rsvp.setName(request.getName().trim());
    // 연락처는 선택 입력: 값이 있을 때만 정규화하여 저장, 없으면 null
    String contact = request.getContact();
    rsvp.setContact(
        contact == null || contact.isBlank() ? null : ContactNormalizer.normalize(contact));
    rsvp.setSide(request.getSide());
    rsvp.setAttendance(request.getAttendance());
    rsvp.setPrivacyConsent(request.getPrivacyConsent());

    if (request.getAttendance() == Attendance.ATTENDING) {
      if (request.getMealOption() == null) {
        throw new ValidationException("식사 여부는 필수입니다");
      }
      rsvp.setMealOption(request.getMealOption());
      if (request.getMealOption() == com.wedding.invitation.rsvp.domain.MealOption.WILL_EAT) {
        // 식사함: 대인/소인 인원 반영(미입력 시 0)
        rsvp.setAdultCount(clampCount(request.getAdultCount(), "대인"));
        rsvp.setChildCount(clampCount(request.getChildCount(), "소인"));
      } else {
        // 식사안함: 인원 미적용
        rsvp.setAdultCount(null);
        rsvp.setChildCount(null);
      }
    } else {
      // 불참: 인원/식사 필드는 저장하지 않음
      rsvp.setAdultCount(null);
      rsvp.setChildCount(null);
      rsvp.setMealOption(null);
    }
    return rsvp;
  }

  private int clampCount(Integer value, String label) {
    int v = value == null ? 0 : value;
    if (v < COUNT_MIN || v > COUNT_MAX) {
      throw new ValidationException(label + " 인원은 " + COUNT_MIN + "~" + COUNT_MAX + "명이어야 합니다");
    }
    return v;
  }
}
