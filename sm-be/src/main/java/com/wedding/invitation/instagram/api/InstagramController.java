package com.wedding.invitation.instagram.api;

import com.wedding.invitation.instagram.dto.InstagramItem;
import com.wedding.invitation.instagram.service.InstagramService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Instagram 피드 REST 컨트롤러. */
@RestController
@RequestMapping("/api/instagram")
public class InstagramController {

  private final InstagramService instagramService;

  public InstagramController(InstagramService instagramService) {
    this.instagramService = instagramService;
  }

  @GetMapping("/feed")
  public ResponseEntity<List<InstagramItem>> feed() {
    return ResponseEntity.ok(instagramService.getFeed());
  }
}
