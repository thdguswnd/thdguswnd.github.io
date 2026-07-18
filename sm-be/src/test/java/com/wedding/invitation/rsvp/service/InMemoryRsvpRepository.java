package com.wedding.invitation.rsvp.service;

import com.wedding.invitation.rsvp.domain.Rsvp;
import com.wedding.invitation.rsvp.repository.RsvpRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

/** 테스트용 인메모리 RsvpRepository (연락처 upsert 시맨틱 재현). */
public class InMemoryRsvpRepository implements RsvpRepository {

  private final Map<String, Rsvp> byContact = new LinkedHashMap<>();
  private final AtomicLong seq = new AtomicLong(1);

  @Override
  public Optional<Rsvp> findByContact(String contact) {
    return Optional.ofNullable(byContact.get(contact));
  }

  @Override
  public void insert(Rsvp rsvp) {
    rsvp.setId(seq.getAndIncrement());
    byContact.put(rsvp.getContact(), rsvp);
  }

  @Override
  public void update(Rsvp rsvp) {
    byContact.put(rsvp.getContact(), rsvp);
  }

  @Override
  public List<Rsvp> findAll() {
    return new ArrayList<>(byContact.values());
  }

  @Override
  public int anonymizeOlderThan(Instant threshold) {
    int count = 0;
    for (Rsvp r : byContact.values()) {
      if (r.getCreatedAt() != null && r.getCreatedAt().isBefore(threshold)) {
        r.setName("(익명)");
        r.setContact(r.getContact());
        count++;
      }
    }
    return count;
  }

  public int size() {
    return byContact.size();
  }
}
