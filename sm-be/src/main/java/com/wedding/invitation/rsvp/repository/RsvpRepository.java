package com.wedding.invitation.rsvp.repository;

import com.wedding.invitation.rsvp.domain.Rsvp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

/** RSVP 영속화 추상 인터페이스. 구현은 MyBatis Mapper 기반. */
public interface RsvpRepository {

  /** 연락처로 조회. */
  Optional<Rsvp> findByContact(String contact);

  /** 신규 저장. */
  void insert(Rsvp rsvp);

  /** 기존 레코드 갱신(연락처 기준). */
  void update(Rsvp rsvp);

  /** 전체 조회(추후 관리자용). */
  List<Rsvp> findAll();

  /**
   * 기준 시각 이전에 생성되어 만료된 RSVP 개인정보를 익명화한다.
   *
   * @param threshold 이 시각 이전(created_at) 레코드가 대상
   * @return 익명화된 레코드 수
   */
  int anonymizeOlderThan(Instant threshold);
}
