package com.wedding.invitation.rsvp.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.wedding.invitation.rsvp.domain.Attendance;
import com.wedding.invitation.rsvp.domain.MealOption;
import com.wedding.invitation.rsvp.domain.Rsvp;
import com.wedding.invitation.rsvp.domain.Side;
import com.wedding.invitation.rsvp.dto.RsvpRequest;
import net.jqwik.api.Arbitraries;
import net.jqwik.api.Arbitrary;
import net.jqwik.api.ForAll;
import net.jqwik.api.Property;
import net.jqwik.api.Provide;

/** RsvpService.validateAndBuild 에 대한 PBT (P-01 결정성, P-04 불참 정규화). */
class RsvpPropertyTest {

  private final RsvpService service = new RsvpService(new InMemoryRsvpRepository());

  @Provide
  Arbitrary<RsvpRequest> attendingRequests() {
    Arbitrary<String> names = Arbitraries.strings().alpha().ofMinLength(1).ofMaxLength(20);
    Arbitrary<Integer> adults = Arbitraries.integers().between(1, 2);
    Arbitrary<Integer> children = Arbitraries.integers().between(0, 2);
    Arbitrary<Side> sides = Arbitraries.of(Side.class);
    Arbitrary<MealOption> meals = Arbitraries.of(MealOption.class);
    return net.jqwik.api.Combinators.combine(names, adults, children, sides, meals)
        .as(
            (name, adult, child, side, meal) -> {
              RsvpRequest r = new RsvpRequest();
              r.setName(name);
              r.setContact("01012345678");
              r.setSide(side);
              r.setAttendance(Attendance.ATTENDING);
              r.setAdultCount(adult);
              r.setChildCount(child);
              r.setMealOption(meal);
              return r;
            });
  }

  /** P-01: 동일 입력에 대한 검증/변환 결과는 결정적(항상 동일). */
  @Property
  void validation_is_deterministic(@ForAll("attendingRequests") RsvpRequest req) {
    Rsvp first = service.validateAndBuild(req);
    Rsvp second = service.validateAndBuild(req);
    assertThat(first).isEqualTo(second);
  }

  /** P-04: 불참이면 입력 인원/식사값과 무관하게 저장 필드는 null. */
  @Property
  void not_attending_nullifies_counts(
      @ForAll("attendingRequests") RsvpRequest req,
      @ForAll @net.jqwik.api.constraints.IntRange(min = -5, max = 10) int anyAdult) {
    req.setAttendance(Attendance.NOT_ATTENDING);
    req.setAdultCount(anyAdult);
    req.setChildCount(anyAdult);
    Rsvp result = service.validateAndBuild(req);
    assertThat(result.getAdultCount()).isNull();
    assertThat(result.getChildCount()).isNull();
    assertThat(result.getMealOption()).isNull();
  }
}
