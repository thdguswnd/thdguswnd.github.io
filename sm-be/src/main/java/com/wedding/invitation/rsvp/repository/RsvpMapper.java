package com.wedding.invitation.rsvp.repository;

import com.wedding.invitation.rsvp.domain.Rsvp;
import java.time.Instant;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/** RSVP MyBatis Mapper. SQL 은 mapper/RsvpMapper.xml 에 정의. */
@Mapper
public interface RsvpMapper {

  Rsvp findByContact(@Param("contact") String contact);

  void insert(Rsvp rsvp);

  void updateByContact(Rsvp rsvp);

  List<Rsvp> findAll();

  int anonymizeOlderThan(@Param("threshold") Instant threshold, @Param("now") Instant now);
}
