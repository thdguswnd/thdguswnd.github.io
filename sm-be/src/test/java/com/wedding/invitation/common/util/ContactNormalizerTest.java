package com.wedding.invitation.common.util;

import static org.assertj.core.api.Assertions.assertThat;

import net.jqwik.api.ForAll;
import net.jqwik.api.Property;
import net.jqwik.api.constraints.AlphaChars;
import net.jqwik.api.constraints.StringLength;
import org.junit.jupiter.api.Test;

/** ContactNormalizer 예시 테스트 + PBT(P-02 멱등성). */
class ContactNormalizerTest {

  @Test
  void normalizes_11_digit_number() {
    assertThat(ContactNormalizer.normalize("01012345678")).isEqualTo("010-1234-5678");
    assertThat(ContactNormalizer.normalize("010-1234-5678")).isEqualTo("010-1234-5678");
    assertThat(ContactNormalizer.normalize("010 1234 5678")).isEqualTo("010-1234-5678");
  }

  @Test
  void normalizes_10_digit_number() {
    assertThat(ContactNormalizer.normalize("0111234567")).isEqualTo("011-123-4567");
  }

  @Test
  void null_returns_null() {
    assertThat(ContactNormalizer.normalize(null)).isNull();
  }

  /** P-02: 정규화는 멱등이다 — normalize(normalize(x)) == normalize(x). */
  @Property
  void normalization_is_idempotent(@ForAll @StringLength(max = 20) @AlphaChars String raw) {
    String once = ContactNormalizer.normalize(raw);
    String twice = ContactNormalizer.normalize(once);
    assertThat(twice).isEqualTo(once);
  }

  /** P-02(숫자 입력): 임의 숫자열에 대해서도 멱등. */
  @Property
  void normalization_is_idempotent_for_digits(@ForAll @StringLength(min = 0, max = 15) String raw) {
    String once = ContactNormalizer.normalize(raw);
    String twice = ContactNormalizer.normalize(once);
    assertThat(twice).isEqualTo(once);
  }
}
