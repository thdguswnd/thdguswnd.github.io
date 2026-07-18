package com.wedding.invitation.rsvp.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wedding.invitation.rsvp.domain.Attendance;
import com.wedding.invitation.rsvp.domain.MealOption;
import com.wedding.invitation.rsvp.domain.Side;
import net.jqwik.api.Arbitraries;
import net.jqwik.api.Arbitrary;
import net.jqwik.api.Combinators;
import net.jqwik.api.ForAll;
import net.jqwik.api.Property;
import net.jqwik.api.Provide;

/** P-03: RsvpRequest DTO 의 JSON 직렬화 라운드트립 불변식. */
class RsvpSerializationPropertyTest {

  private final ObjectMapper mapper = new ObjectMapper();

  @Provide
  Arbitrary<RsvpRequest> requests() {
    Arbitrary<String> names = Arbitraries.strings().alpha().ofMinLength(1).ofMaxLength(20);
    Arbitrary<Integer> adults = Arbitraries.integers().between(1, 2);
    Arbitrary<Integer> children = Arbitraries.integers().between(0, 2);
    Arbitrary<Side> sides = Arbitraries.of(Side.class);
    Arbitrary<MealOption> meals = Arbitraries.of(MealOption.class);
    return Combinators.combine(names, adults, children, sides, meals)
        .as(
            (name, adult, child, side, meal) -> {
              RsvpRequest r = new RsvpRequest();
              r.setName(name);
              r.setContact("010-1234-5678");
              r.setSide(side);
              r.setAttendance(Attendance.ATTENDING);
              r.setAdultCount(adult);
              r.setChildCount(child);
              r.setMealOption(meal);
              return r;
            });
  }

  @Property
  void serialize_then_deserialize_preserves_fields(@ForAll("requests") RsvpRequest original)
      throws Exception {
    String json = mapper.writeValueAsString(original);
    RsvpRequest restored = mapper.readValue(json, RsvpRequest.class);

    assertThat(restored.getName()).isEqualTo(original.getName());
    assertThat(restored.getContact()).isEqualTo(original.getContact());
    assertThat(restored.getSide()).isEqualTo(original.getSide());
    assertThat(restored.getAttendance()).isEqualTo(original.getAttendance());
    assertThat(restored.getAdultCount()).isEqualTo(original.getAdultCount());
    assertThat(restored.getChildCount()).isEqualTo(original.getChildCount());
    assertThat(restored.getMealOption()).isEqualTo(original.getMealOption());
  }
}
