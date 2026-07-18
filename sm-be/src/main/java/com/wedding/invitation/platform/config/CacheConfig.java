package com.wedding.invitation.platform.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.wedding.invitation.config.WeddingProperties;
import java.util.List;
import java.util.concurrent.TimeUnit;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Caffeine 캐시 설정. 캐시별 TTL: gallery(5분), instagram(10분). */
@Configuration
public class CacheConfig {

  @Bean
  public CacheManager cacheManager(WeddingProperties properties) {
    CaffeineCache gallery =
        new CaffeineCache(
            "gallery",
            Caffeine.newBuilder()
                .expireAfterWrite(properties.getGallery().getCacheTtlMinutes(), TimeUnit.MINUTES)
                .maximumSize(100)
                .build());
    CaffeineCache instagram =
        new CaffeineCache(
            "instagram",
            Caffeine.newBuilder()
                .expireAfterWrite(properties.getInstagram().getCacheTtlMinutes(), TimeUnit.MINUTES)
                .maximumSize(50)
                .build());
    SimpleCacheManager manager = new SimpleCacheManager();
    manager.setCaches(List.of(gallery, instagram));
    return manager;
  }
}
