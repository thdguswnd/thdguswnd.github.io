package com.wedding.invitation.rsvp.api;

import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wedding.invitation.common.exception.ValidationException;
import com.wedding.invitation.rsvp.domain.Attendance;
import com.wedding.invitation.rsvp.domain.MealOption;
import com.wedding.invitation.rsvp.domain.Side;
import com.wedding.invitation.rsvp.dto.RsvpRequest;
import com.wedding.invitation.rsvp.service.RsvpService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** RsvpController MockMvc 테스트 (전체 컨텍스트 + RsvpService 목). */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RsvpControllerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;
  @MockBean private RsvpService rsvpService;

  private RsvpRequest validRequest() {
    RsvpRequest r = new RsvpRequest();
    r.setName("홍길동");
    r.setContact("010-1234-5678");
    r.setSide(Side.GROOM);
    r.setAttendance(Attendance.ATTENDING);
    r.setAdultCount(2);
    r.setChildCount(0);
    r.setMealOption(MealOption.WILL_EAT);
    return r;
  }

  @Test
  void submit_valid_returns_200() throws Exception {
    mockMvc
        .perform(
            post("/api/rsvp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest())))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true));
  }

  @Test
  void submit_missing_name_returns_400() throws Exception {
    RsvpRequest req = validRequest();
    req.setName("");
    mockMvc
        .perform(
            post("/api/rsvp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
        .andExpect(status().isBadRequest());
  }

  @Test
  void submit_invalid_contact_returns_400() throws Exception {
    RsvpRequest req = validRequest();
    req.setContact("not-a-phone");
    mockMvc
        .perform(
            post("/api/rsvp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
        .andExpect(status().isBadRequest());
  }

  @Test
  void submit_business_validation_failure_returns_400() throws Exception {
    doThrow(new ValidationException("성인 인원은 1~2명이어야 합니다"))
        .when(rsvpService)
        .register(org.mockito.ArgumentMatchers.any());
    mockMvc
        .perform(
            post("/api/rsvp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest())))
        .andExpect(status().isBadRequest());
  }
}
