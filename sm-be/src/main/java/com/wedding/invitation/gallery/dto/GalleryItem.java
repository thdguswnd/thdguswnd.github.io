package com.wedding.invitation.gallery.dto;

/** 갤러리 항목 응답 DTO(서명 URL 포함). */
public class GalleryItem {

  private String signedUrl;
  private int order;

  public GalleryItem() {}

  public GalleryItem(String signedUrl, int order) {
    this.signedUrl = signedUrl;
    this.order = order;
  }

  public String getSignedUrl() {
    return signedUrl;
  }

  public void setSignedUrl(String signedUrl) {
    this.signedUrl = signedUrl;
  }

  public int getOrder() {
    return order;
  }

  public void setOrder(int order) {
    this.order = order;
  }
}
