// RSVP 제출 래퍼. Google Apps Script 웹앱으로 전송(no-cors, text/plain).
import type { RsvpRequest } from './types';

// Google Apps Script 웹앱 엔드포인트(RSVP → Google Sheets 저장)
const RSVP_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbx9gUXQmrTTJXhl0SSHVCfydf2m5QBqxjq9DMheSga00VHkCDy_b7uv4AayX_FzYWGdJA/exec';

const DEFAULT_TIMEOUT_MS = 8000;

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = {
  /**
   * RSVP 제출. Apps Script는 CORS 응답 헤더를 주지 않으므로 no-cors로 전송한다.
   * 응답 본문은 읽을 수 없으나(opaque), 저장 자체는 정상 수행된다.
   * 네트워크 오류 시에만 예외를 던진다.
   */
  async submitRsvp(payload: RsvpRequest): Promise<void> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
    try {
      await fetch(RSVP_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch {
      throw new ApiError('네트워크 오류가 발생했습니다');
    } finally {
      clearTimeout(timer);
    }
  },
};
