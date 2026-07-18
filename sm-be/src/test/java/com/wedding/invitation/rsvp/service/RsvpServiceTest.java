package com.wedding.invitation.rsvp.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.wedding.invitation.common.exception.ValidationException;
import com.wedding.invitation.rsvp.domain.Attendance;
import com.wedding.invitation.rsvp.domain.MealOption;
import com.wedding.invitation.rsvp.domain.Side;
import com.wedding.invitation.rsvp.dto.RsvpRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** RsvpService 예시 기반 테스트 + P-05(upsert 불변식). */
class RsvpServiceTest {

  private InMemoryRsvpRepository repository;
  private RsvpService service;

  @BeforeEach
  void setUp() {
    repository = new InMemoryRsvpRepository();
    service = new RsvpService(repository);
  }

  private RsvpRequest attending(String contact, int adult) {
    RsvpRequest r = new RsvpRequest();
    r.setName("홍길동");
    r.setContact(contact);
    r.setSide(Side.GROOM);
    r.setAttendance(Attendance.ATTENDING);
    r.setAdultCount(adult);
    r.setChildCount(0);
    r.setMealOption(MealOption.WILL_EAT);
    return r;
  }

  @Test
  void registers_new_rsvp() {
    service.register(attending("010-1234-5678", 2));
    assertThat(repository.size()).isEqualTo(1);
  }

  @Test
  void rejects_adult_count_over_max() {
    RsvpRequest req = attending("010-1234-5678", 25); // 상한(20) 초과
    assertThatThrownBy(() -> service.register(req)).isInstanceOf(ValidationException.class);
  }

  @Test
  void allows_zero_additional_people() {
    RsvpRequest req = attending("010-1234-5678", 0); // 추가인원 0 허용
    service.register(req);
    assertThat(repository.findByContact("010-1234-5678").orElseThrow().getAdultCount()).isZero();
  }

  @Test
  void allows_missing_contact() {
    RsvpRequest req = attending(null, 1);
    service.register(req);
    assertThat(repository.size()).isEqualTo(1);
  }

  @Test
  void rejects_missing_meal_when_attending() {
    RsvpRequest req = attending("010-1234-5678", 1);
    req.setMealOption(null);
    assertThatThrownBy(() -> service.register(req)).isInstanceOf(ValidationException.class);
  }

  /** P-05: 동일 연락처로 여러 번 제출해도 레코드는 1건, 값은 마지막 제출과 일치. */
  @Test
  void upsert_keeps_single_record_per_contact() {
    service.register(attending("010-1234-5678", 1));
    service.register(attending("010 1234 5678", 2)); // 동일 번호(형식만 다름)
    service.register(attending("01012345678", 2));

    assertThat(repository.size()).isEqualTo(1);
    assertThat(repository.findByContact("010-1234-5678")).isPresent();
    assertThat(repository.findByContact("010-1234-5678").get().getAdultCount()).isEqualTo(2);
  }

  @Test
  void not_attending_stores_null_counts() {
    RsvpRequest req = new RsvpRequest();
    req.setName("김철수");
    req.setContact("010-9999-8888");
    req.setSide(Side.BRIDE);
    req.setAttendance(Attendance.NOT_ATTENDING);
    req.setAdultCount(2);
    req.setMealOption(MealOption.WILL_EAT);
    service.register(req);

    var saved = repository.findByContact("010-9999-8888").orElseThrow();
    assertThat(saved.getAdultCount()).isNull();
    assertThat(saved.getMealOption()).isNull();
  }
}
