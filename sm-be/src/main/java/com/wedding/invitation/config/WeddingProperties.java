package com.wedding.invitation.config;

import java.time.LocalDate;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/** 청첩장 도메인 설정(application.yml 의 `wedding.*`). */
@Component
@ConfigurationProperties(prefix = "wedding")
public class WeddingProperties {

  private LocalDate weddingDate;
  private Rsvp rsvp = new Rsvp();
  private Gallery gallery = new Gallery();
  private Instagram instagram = new Instagram();
  private Cors cors = new Cors();
  private Storage storage = new Storage();

  public LocalDate getWeddingDate() {
    return weddingDate;
  }

  public void setWeddingDate(LocalDate weddingDate) {
    this.weddingDate = weddingDate;
  }

  public Rsvp getRsvp() {
    return rsvp;
  }

  public void setRsvp(Rsvp rsvp) {
    this.rsvp = rsvp;
  }

  public Gallery getGallery() {
    return gallery;
  }

  public void setGallery(Gallery gallery) {
    this.gallery = gallery;
  }

  public Instagram getInstagram() {
    return instagram;
  }

  public void setInstagram(Instagram instagram) {
    this.instagram = instagram;
  }

  public Cors getCors() {
    return cors;
  }

  public void setCors(Cors cors) {
    this.cors = cors;
  }

  public Storage getStorage() {
    return storage;
  }

  public void setStorage(Storage storage) {
    this.storage = storage;
  }

  public static class Rsvp {
    private int retentionMonths = 3;

    public int getRetentionMonths() {
      return retentionMonths;
    }

    public void setRetentionMonths(int retentionMonths) {
      this.retentionMonths = retentionMonths;
    }
  }

  public static class Gallery {
    private int signedUrlTtlMinutes = 15;
    private int cacheTtlMinutes = 5;

    public int getSignedUrlTtlMinutes() {
      return signedUrlTtlMinutes;
    }

    public void setSignedUrlTtlMinutes(int signedUrlTtlMinutes) {
      this.signedUrlTtlMinutes = signedUrlTtlMinutes;
    }

    public int getCacheTtlMinutes() {
      return cacheTtlMinutes;
    }

    public void setCacheTtlMinutes(int cacheTtlMinutes) {
      this.cacheTtlMinutes = cacheTtlMinutes;
    }
  }

  public static class Instagram {
    private int feedLimit = 9;
    private int cacheTtlMinutes = 10;
    private int apiTimeoutMs = 3000;
    private boolean mock = true;

    public int getFeedLimit() {
      return feedLimit;
    }

    public void setFeedLimit(int feedLimit) {
      this.feedLimit = feedLimit;
    }

    public int getCacheTtlMinutes() {
      return cacheTtlMinutes;
    }

    public void setCacheTtlMinutes(int cacheTtlMinutes) {
      this.cacheTtlMinutes = cacheTtlMinutes;
    }

    public int getApiTimeoutMs() {
      return apiTimeoutMs;
    }

    public void setApiTimeoutMs(int apiTimeoutMs) {
      this.apiTimeoutMs = apiTimeoutMs;
    }

    public boolean isMock() {
      return mock;
    }

    public void setMock(boolean mock) {
      this.mock = mock;
    }
  }

  public static class Cors {
    private String allowedOrigins = "http://localhost:5173";

    public String getAllowedOrigins() {
      return allowedOrigins;
    }

    public void setAllowedOrigins(String allowedOrigins) {
      this.allowedOrigins = allowedOrigins;
    }
  }

  public static class Storage {
    private String provider = "local";
    private String bucket = "";
    // Azure 스토리지 계정명(azure 프로파일). GCS 에서는 미사용.
    private String account = "";

    public String getProvider() {
      return provider;
    }

    public void setProvider(String provider) {
      this.provider = provider;
    }

    public String getBucket() {
      return bucket;
    }

    public void setBucket(String bucket) {
      this.bucket = bucket;
    }

    public String getAccount() {
      return account;
    }

    public void setAccount(String account) {
      this.account = account;
    }
  }
}
