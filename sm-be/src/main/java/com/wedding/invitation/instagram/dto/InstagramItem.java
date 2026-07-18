package com.wedding.invitation.instagram.dto;

/** Instagram 피드 항목 응답 DTO. */
public class InstagramItem {

  private String mediaUrl;
  private String permalink;
  private String caption;

  public InstagramItem() {}

  public InstagramItem(String mediaUrl, String permalink, String caption) {
    this.mediaUrl = mediaUrl;
    this.permalink = permalink;
    this.caption = caption;
  }

  public String getMediaUrl() {
    return mediaUrl;
  }

  public void setMediaUrl(String mediaUrl) {
    this.mediaUrl = mediaUrl;
  }

  public String getPermalink() {
    return permalink;
  }

  public void setPermalink(String permalink) {
    this.permalink = permalink;
  }

  public String getCaption() {
    return caption;
  }

  public void setCaption(String caption) {
    this.caption = caption;
  }
}
