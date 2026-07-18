package com.wedding.invitation.platform.security;

import com.wedding.invitation.config.WeddingProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** CORS 설정 — 허용 오리진만 접근 (SECURITY-08). */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

  private final WeddingProperties properties;

  public CorsConfig(WeddingProperties properties) {
    this.properties = properties;
  }

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    String[] origins = properties.getCors().getAllowedOrigins().split(",");
    registry
        .addMapping("/api/**")
        .allowedOrigins(origins)
        .allowedMethods("GET", "POST")
        .allowedHeaders("*")
        .maxAge(3600);
  }
}
