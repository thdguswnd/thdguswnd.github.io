import { useCallback, useState } from 'react';
import { apiClient } from '../lib/apiClient';
import type { RsvpRequest } from '../lib/types';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

/** RSVP 제출 훅. 제출 상태와 사용자 메시지 관리. */
export function useRsvpSubmit() {
  const [state, setState] = useState<SubmitState>('idle');
  const [message, setMessage] = useState('');

  async function submit(payload: RsvpRequest) {
    setState('submitting');
    try {
      await apiClient.submitRsvp(payload);
      setState('success');
      setMessage('참석 의사가 전달되었습니다. 감사합니다!');
    } catch {
      setState('error');
      setMessage('제출 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  }

  // 제출 후 값 수정 시 초기 상태로 되돌림(버튼 복귀)
  const reset = useCallback(() => {
    setState('idle');
    setMessage('');
  }, []);

  return { state, message, submit, reset };
}
