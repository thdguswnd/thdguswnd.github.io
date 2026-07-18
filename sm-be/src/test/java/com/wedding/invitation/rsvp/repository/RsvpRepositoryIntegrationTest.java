package com.wedding.invitation.rsvp.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.wedding.invitation.rsvp.domain.Attendance;
import com.wedding.invitation.rsvp.domain.MealOption;
import com.wedding.invitation.rsvp.domain.Rsvp;
import com.wedding.invitation.rsvp.domain.Side;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/** RsvpRepository(MyBatis) 통합 테스트 — H2(PostgreSQL 모드) + Flyway. */
@SpringBootTest
@ActiveProfiles("test")
class RsvpRepositoryIntegrationTest {

  @Autowired private RsvpRepository repository;

  private Rsvp attending(String contact) {
    Rsvp r = new Rsvp();
    r.setName("홍길동");
    r.setContact(contact);
    r.setSide(Side.GROOM);
    r.setAttendance(Attendance.ATTENDING);
    r.setAdultCount(2);
    r.setChildCount(1);
    r.setMealOption(MealOption.WILL_EAT);
    Instant now = Instant.now();
    r.setCreatedAt(now);
    r.setUpdatedAt(now);
    return r;
  }

  @Test
  void insert_and_find_by_contact() {
    repository.insert(attending("010-1000-2000"));
    var found = repository.findByContact("010-1000-2000");
    assertThat(found).isPresent();
    assertThat(found.get().getAdultCount()).isEqualTo(2);
    assertThat(found.get().getSide()).isEqualTo(Side.GROOM);
  }

  @Test
  void update_by_contact() {
    repository.insert(attending("010-1000-3000"));
    Rsvp existing = repository.findByContact("010-1000-3000").orElseThrow();
    existing.setAdultCount(1);
    existing.setAttendance(Attendance.NOT_ATTENDING);
    existing.setUpdatedAt(Instant.now());
    repository.update(existing);

    Rsvp updated = repository.findByContact("010-1000-3000").orElseThrow();
    assertThat(updated.getAdultCount()).isEqualTo(1);
    assertThat(updated.getAttendance()).isEqualTo(Attendance.NOT_ATTENDING);
  }

  @Test
  void anonymize_older_than_threshold() {
    Rsvp old = attending("010-1000-4000");
    old.setCreatedAt(Instant.now().minus(120, ChronoUnit.DAYS));
    repository.insert(old);

    int affected = repository.anonymizeOlderThan(Instant.now().minus(90, ChronoUnit.DAYS));
    assertThat(affected).isGreaterThanOrEqualTo(1);
    assertThat(repository.findByContact("010-1000-4000")).isEmpty();
  }
}
