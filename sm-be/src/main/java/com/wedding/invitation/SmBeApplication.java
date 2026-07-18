package com.wedding.invitation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

/** 모바일 청첩장 백엔드 애플리케이션 진입점. */
@SpringBootApplication
@EnableCaching
@EnableScheduling
public class SmBeApplication {

  public static void main(String[] args) {
    SpringApplication.run(SmBeApplication.class, args);
  }
}
