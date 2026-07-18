package com.wedding.invitation.instagram.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.wedding.invitation.config.WeddingProperties;
import com.wedding.invitation.instagram.dto.InstagramItem;
import com.wedding.invitation.platform.instagram.InstagramClient;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/** InstagramService 단위 테스트 (제한/폴백). */
@ExtendWith(MockitoExtension.class)
class InstagramServiceTest {

  @Mock private InstagramClient client;

  private WeddingProperties props() {
    WeddingProperties p = new WeddingProperties();
    p.getInstagram().setFeedLimit(9);
    return p;
  }

  @Test
  void empty_feed_returns_empty_fallback() {
    when(client.fetchFeed(9)).thenReturn(List.of());
    InstagramService service = new InstagramService(client, props());
    assertThat(service.getFeed()).isEmpty();
  }

  @Test
  void limits_feed_to_configured_size() {
    List<InstagramItem> many =
        java.util.stream.IntStream.range(0, 20)
            .mapToObj(i -> new InstagramItem("u" + i, "p" + i, "c" + i))
            .collect(java.util.stream.Collectors.toList());
    when(client.fetchFeed(9)).thenReturn(many);
    InstagramService service = new InstagramService(client, props());
    assertThat(service.getFeed()).hasSize(9);
  }
}
