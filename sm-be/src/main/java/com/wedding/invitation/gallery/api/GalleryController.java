package com.wedding.invitation.gallery.api;

import com.wedding.invitation.gallery.dto.GalleryItem;
import com.wedding.invitation.gallery.service.GalleryService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 갤러리 조회 REST 컨트롤러. */
@RestController
@RequestMapping("/api/gallery")
public class GalleryController {

  private final GalleryService galleryService;

  public GalleryController(GalleryService galleryService) {
    this.galleryService = galleryService;
  }

  @GetMapping
  public ResponseEntity<List<GalleryItem>> list() {
    return ResponseEntity.ok(galleryService.listImages());
  }
}
