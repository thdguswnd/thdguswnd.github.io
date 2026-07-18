package com.wedding.invitation.rsvp.retention;

import com.wedding.invitation.config.WeddingProperties;
import com.wedding.invitation.rsvp.repository.RsvpRepository;
import java.time.Instant;
import java.time.LocalDate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * RSVP 개인정보 보존 배치 (NFR-S7).
 *
 * <p>예식일 + 보존기간(기본 3개월) 경과 시, 저장된 RSVP 의 PII(이름/연락처)를 익명화한다. 멱등(이미 익명 레코드 제외). 일 1회 실행.
 */
@Component
public class RsvpRetentionScheduler {

  private static final Logger log = LoggerFactory.getLogger(RsvpRetentionScheduler.class);

  private final RsvpRepository repository;
  private final WeddingProperties properties;

  public RsvpRetentionScheduler(RsvpRepository repository, WeddingProperties properties) {
    this.repository = repository;
    this.properties = properties;
  }

  /** 매일 03:00 실행. */
  @Scheduled(cron = "0 0 3 * * *")
  public void purgeExpired() {
    LocalDate weddingDate = properties.getWeddingDate();
    if (weddingDate == null) {
      return;
    }
    LocalDate cutoff = weddingDate.plusMonths(properties.getRsvp().getRetentionMonths());
    if (LocalDate.now().isBefore(cutoff)) {
      return; // 보존 기간 내
    }
    int affected = repository.anonymizeOlderThan(Instant.now());
    if (affected > 0) {
      log.info("RSVP 보존 배치: {}건 익명화 (cutoff={})", affected, cutoff);
    }
  }
}
