package com.wedding.invitation.rsvp.retention;

import static org.assertj.core.api.Assertions.assertThat;

import com.wedding.invitation.config.WeddingProperties;
import com.wedding.invitation.rsvp.domain.Attendance;
import com.wedding.invitation.rsvp.domain.Rsvp;
import com.wedding.invitation.rsvp.domain.Side;
import com.wedding.invitation.rsvp.service.InMemoryRsvpRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import org.junit.jupiter.api.Test;

/** RsvpRetentionScheduler 테스트 — 보존 기간 경과 시 익명화, 이내엔 미실행. */
class RsvpRetentionSchedulerTest {

  private Rsvp record() {
    Rsvp r = new Rsvp();
    r.setName("홍길동");
    r.setContact("010-1234-5678");
    r.setSide(Side.GROOM);
    r.setAttendance(Attendance.ATTENDING);
    r.setAdultCount(2);
    r.setChildCount(0);
    r.setCreatedAt(Instant.now().minus(200, ChronoUnit.DAYS));
    r.setUpdatedAt(Instant.now());
    return r;
  }

  private WeddingProperties props(LocalDate weddingDate, int months) {
    WeddingProperties p = new WeddingProperties();
    p.setWeddingDate(weddingDate);
    p.getRsvp().setRetentionMonths(months);
    return p;
  }

  @Test
  void anonymizes_when_past_retention() {
    InMemoryRsvpRepository repo = new InMemoryRsvpRepository();
    repo.insert(record());
    // 예식일이 1년 전 → 보존기간(3개월) 경과
    var scheduler = new RsvpRetentionScheduler(repo, props(LocalDate.now().minusYears(1), 3));

    scheduler.purgeExpired();

    assertThat(repo.findByContact("010-1234-5678").orElseThrow().getName()).isEqualTo("(익명)");
  }

  @Test
  void does_nothing_within_retention() {
    InMemoryRsvpRepository repo = new InMemoryRsvpRepository();
    repo.insert(record());
    // 예식일이 미래 → 보존기간 이내
    var scheduler = new RsvpRetentionScheduler(repo, props(LocalDate.now().plusMonths(1), 3));

    scheduler.purgeExpired();

    assertThat(repo.findByContact("010-1234-5678").orElseThrow().getName()).isEqualTo("홍길동");
  }
}
