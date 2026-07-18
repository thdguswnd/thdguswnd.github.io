package com.wedding.invitation.platform.config;

import com.wedding.invitation.config.WeddingProperties;
import java.time.Duration;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/** 외부 호출용 RestTemplate. Instagram API timeout 을 설정(RESILIENCY-10). */
@Configuration
public class RestTemplateConfig {

  @Bean
  public RestTemplate restTemplate(RestTemplateBuilder builder, WeddingProperties properties) {
    Duration timeout = Duration.ofMillis(properties.getInstagram().getApiTimeoutMs());
    return builder.setConnectTimeout(timeout).setReadTimeout(timeout).build();
  }
}
