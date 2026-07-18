package com.wedding.invitation.rsvp.api;

import com.wedding.invitation.rsvp.dto.RsvpRequest;
import com.wedding.invitation.rsvp.dto.RsvpResponse;
import com.wedding.invitation.rsvp.service.RsvpService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** RSVP 접수 REST 컨트롤러. */
@RestController
@RequestMapping("/api/rsvp")
public class RsvpController {

  private final RsvpService rsvpService;

  public RsvpController(RsvpService rsvpService) {
    this.rsvpService = rsvpService;
  }

  /**
   * 참석 의사를 접수한다.
   *
   * @param request 검증 대상 요청
   * @return 접수 확인
   */
  @PostMapping
  public ResponseEntity<RsvpResponse> submit(@Valid @RequestBody RsvpRequest request) {
    rsvpService.register(request);
    return ResponseEntity.ok(RsvpResponse.ok());
  }
}
