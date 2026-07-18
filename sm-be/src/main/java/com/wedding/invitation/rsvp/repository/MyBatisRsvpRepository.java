package com.wedding.invitation.rsvp.repository;

import com.wedding.invitation.rsvp.domain.Rsvp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

/** MyBatis 기반 RsvpRepository 구현. */
@Repository
public class MyBatisRsvpRepository implements RsvpRepository {

  private final RsvpMapper mapper;

  public MyBatisRsvpRepository(RsvpMapper mapper) {
    this.mapper = mapper;
  }

  @Override
  public Optional<Rsvp> findByContact(String contact) {
    return Optional.ofNullable(mapper.findByContact(contact));
  }

  @Override
  public void insert(Rsvp rsvp) {
    mapper.insert(rsvp);
  }

  @Override
  public void update(Rsvp rsvp) {
    mapper.updateByContact(rsvp);
  }

  @Override
  public List<Rsvp> findAll() {
    return mapper.findAll();
  }

  @Override
  public int anonymizeOlderThan(Instant threshold) {
    return mapper.anonymizeOlderThan(threshold, Instant.now());
  }
}
