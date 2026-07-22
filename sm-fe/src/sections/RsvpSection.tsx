import { useEffect, useState, type ReactNode } from 'react';
import { SectionContainer } from '../components/SectionContainer';
import { useRsvpSubmit } from '../hooks/useRsvpSubmit';
import type { Attendance, MealOption, RsvpRequest, Side } from '../lib/types';

const ACCENT = 'var(--color-accent)';
const LINE = '#e0d8ce';

/** 선택형 큰 버튼(가능/불가) — 라운드 박스 + 체크 표시. */
function ChoiceBox({
  selected,
  onClick,
  label,
  icon,
  testId,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  icon?: string;
  testId: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      aria-pressed={selected}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        padding: '14px 16px',
        borderRadius: 10,
        border: selected ? '1.5px solid #333' : `1px solid ${LINE}`,
        background: selected ? '#fff' : '#faf7f3',
        cursor: 'pointer',
        fontSize: '0.95rem',
      }}
    >
      <span>
        {icon && <span style={{ marginRight: 6 }}>{icon}</span>}
        {label}
      </span>
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          border: selected ? 'none' : `1px solid ${LINE}`,
          background: selected ? '#333' : 'transparent',
          color: '#fff',
          fontSize: '0.7rem',
          lineHeight: '18px',
          textAlign: 'center',
        }}
      >
        {selected ? '✓' : ''}
      </span>
    </button>
  );
}

/** 인원 증감 스테퍼. */
function Stepper({
  label,
  value,
  onChange,
  testId,
  min = 0,
  max = 10,
}: {
  label: ReactNode;
  value: number;
  onChange: (v: number) => void;
  testId: string;
  min?: number;
  max?: number;
}) {
  const btn = {
    width: 30,
    height: 30,
    borderRadius: '50%',
    border: `1px solid ${LINE}`,
    background: '#fff',
    cursor: 'pointer',
    fontSize: '1rem',
  } as const;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 0',
      }}
    >
      <span style={{ fontSize: '0.92rem' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button type="button" style={btn} data-testid={`${testId}-dec`} onClick={() => onChange(Math.max(min, value - 1))}>
          −
        </button>
        <span data-testid={testId} style={{ minWidth: 20, textAlign: 'center' }}>
          {value}
        </span>
        <button type="button" style={btn} data-testid={`${testId}-inc`} onClick={() => onChange(Math.min(max, value + 1))}>
          +
        </button>
      </div>
    </div>
  );
}

/** 열림/닫힘에 따라 fade + 높이 전환되는 래퍼. 자식을 항상 마운트해 fade-out 도 자연스럽게. */
function Collapsible({ open, testId, children }: { open: boolean; testId?: string; children: ReactNode }) {
  return (
    <div
      data-testid={testId}
      aria-hidden={!open}
      style={{
        overflow: 'hidden',
        maxHeight: open ? 2000 : 0,
        opacity: open ? 1 : 0,
        transition: 'max-height 0.5s ease, opacity 0.4s ease',
      }}
    >
      {children}
    </div>
  );
}

/** 마운트되는 순간 fade-in (단계별 등장용). */
function FadeInOnMount({ testId, children }: { testId?: string; children: ReactNode }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      data-testid={testId}
      style={{
        overflow: 'hidden',
        maxHeight: shown ? 2000 : 0,
        opacity: shown ? 1 : 0,
        transition: 'max-height 0.5s ease, opacity 0.4s ease',
      }}
    >
      {children}
    </div>
  );
}

const labelStyle = { fontSize: '0.85rem', color: 'var(--color-muted)', display: 'block', marginBottom: 6 } as const;
const inputStyle = {
  width: '100%',
  border: 'none',
  borderBottom: `1px solid ${LINE}`,
  padding: '8px 2px',
  fontSize: '0.95rem',
  background: 'transparent',
  outline: 'none',
} as const;

/** FR-09: 참석 의사(RSVP) 폼. 가능/불가 → 성함·측 → (성함 입력 후) 식사여부/전달 버튼 순으로 노출. */
export function RsvpSection() {
  const { state, message, submit, reset } = useRsvpSubmit();

  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [name, setName] = useState('');
  const [side, setSide] = useState<Side | null>(null); // 신랑측/신부측 (초기 미선택)
  const [adultCount, setAdultCount] = useState(1); // 대인 인원(0~10), 초기 1
  const [childCount, setChildCount] = useState(0); // 어린이(6~12세) 0~10

  const attending = attendance === 'ATTENDING';
  const selected = attendance !== null; // 가능/불가 중 하나 선택됨
  const sideSelected = side !== null; // 신랑측/신부측 중 하나 선택됨
  const nameEntered = name.trim() !== '';
  // 대인: 혼자(1명) 아이콘 / 2명 이상은 두 명 아이콘 고정
  const adultLabel =
    adultCount === 0 ? '🍽️ 식사 안 해요' : adultCount === 1 ? '🧍 혼자 가요' : '👫 같이 가요';
  // 아이: 인원과 무관하게 아이콘 하나 고정
  const childLabel = '👶 아이도 가요 (6~12세)';

  // 제출 완료/오류 후 값을 수정하면 → 성공 메시지 접고 버튼 다시 노출
  useEffect(() => {
    if (state === 'success' || state === 'error') reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, side, attendance, adultCount, childCount]);

  // 가능/불가 선택 시 RSVP 섹션을 화면 최상단으로 스크롤(키보드 튐 방지)
  function selectAttendance(a: Attendance) {
    setAttendance(a);
    requestAnimationFrame(() => {
      document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nameEntered || !attendance || !side) return;
    const payload: RsvpRequest = { name: name.trim(), side, attendance };
    if (attending) {
      // 대인 0명이면 식사안함으로 간주, 1명 이상이면 식사함 + 인원 반영
      const meal: MealOption = adultCount === 0 ? 'WILL_NOT_EAT' : 'WILL_EAT';
      payload.mealOption = meal;
      if (meal === 'WILL_EAT') {
        payload.adultCount = adultCount;
        payload.childCount = childCount;
      }
    }
    submit(payload);
  }

  return (
    <SectionContainer id="rsvp" title="참석 의사 전달">
      <p style={{ textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
        원활한 예식 진행을 위해 참석 정보를
        <br />
        미리 알려주시면 감사하겠습니다.
      </p>

      <form onSubmit={handleSubmit} data-testid="rsvp-form" style={{ display: 'grid', gap: 22 }}>
        {/* 가능 / 불가 */}
        <div style={{ display: 'flex', gap: 10 }}>
          <ChoiceBox
            testId="rsvp-attendance-yes"
            selected={attending}
            onClick={() => selectAttendance('ATTENDING')}
            label="가능"
            icon="🎉"
          />
          <ChoiceBox
            testId="rsvp-attendance-no"
            selected={attendance === 'NOT_ATTENDING'}
            onClick={() => selectAttendance('NOT_ATTENDING')}
            label="불가"
            icon="🙏"
          />
        </div>

        {/* 1) 가능/불가 선택 → 신랑측/신부측 (미선택 상태로 fade-in) */}
        {selected && (
          <FadeInOnMount testId="rsvp-side-group">
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', gap: 20, justifyContent: 'center', fontSize: '0.95rem' }}>
                <label style={{ cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="side"
                    data-testid="rsvp-side-groom"
                    checked={side === 'GROOM'}
                    onChange={() => setSide('GROOM')}
                  />{' '}
                  신랑측
                </label>
                <label style={{ cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="side"
                    data-testid="rsvp-side-bride"
                    checked={side === 'BRIDE'}
                    onChange={() => setSide('BRIDE')}
                  />{' '}
                  신부측
                </label>
              </div>
            </div>
          </FadeInOnMount>
        )}

        {/* 2) 측 선택 → 식사여부(가능일 때) + 성함 함께 fade-in */}
        {selected && sideSelected && (
          <FadeInOnMount testId="rsvp-mid-group">
            <div style={{ display: 'grid', gap: 22 }}>
              {attending && (
                <div>
                  <label style={labelStyle}>식사 여부</label>
                  <div style={{ borderTop: `1px solid ${LINE}` }}>
                    <Stepper
                      label={adultLabel}
                      value={adultCount}
                      onChange={setAdultCount}
                      testId="rsvp-adult"
                      min={0}
                      max={10}
                    />
                    {/* 대인 1명 이상일 때만 어린이 행 표시 */}
                    {adultCount > 0 && (
                      <div style={{ borderTop: `1px solid ${LINE}` }}>
                        <Stepper
                          label={childLabel}
                          value={childCount}
                          onChange={setChildCount}
                          testId="rsvp-child"
                          min={0}
                          max={10}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div>
                <label style={labelStyle} htmlFor="rsvp-name">
                  성함
                </label>
                <input
                  id="rsvp-name"
                  data-testid="rsvp-name"
                  style={inputStyle}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="성함을 입력해 주세요."
                />
              </div>
            </div>
          </FadeInOnMount>
        )}

        {/* 3) 성함 입력 → 안내문구 + 전달 버튼 (성함 지우면 fade-out) */}
        {selected && (
          <Collapsible open={nameEntered} testId="rsvp-details">
            <div style={{ display: 'grid', gap: 22 }}>
            {/* 개인정보 안내 */}
            <p
              data-testid="rsvp-privacy-notice"
              style={{ fontSize: '0.78rem', color: 'var(--color-muted)', lineHeight: 1.5, margin: 0, textAlign: 'center' }}
            >
              입력하신 성함은 인원 확인 목적으로만 사용되며,
              <br />
              예식 종료 후 일주일 이내에 모두 삭제됩니다.
            </p>

            {/* 전달 버튼(제출 중/완료 시 fade-out) + 상태 메시지 */}
            <div>
              <Collapsible open={state !== 'submitting' && state !== 'success'} testId="rsvp-submit-wrap">
                <button
                  type="submit"
                  data-testid="rsvp-submit"
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 10,
                    border: 'none',
                    background: ACCENT,
                    color: '#fff',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                  }}
                >
                  신랑 & 신부에게 전달하기
                </button>
              </Collapsible>
              <Collapsible
                open={state === 'submitting' || state === 'success' || state === 'error'}
                testId="rsvp-status-wrap"
              >
                <p
                  data-testid="rsvp-message"
                  style={{
                    textAlign: 'center',
                    margin: 0,
                    color: state === 'success' ? 'green' : state === 'error' ? 'crimson' : 'var(--color-muted)',
                  }}
                >
                  {state === 'submitting' ? '전송 중...' : message}
                </p>
              </Collapsible>
            </div>
            </div>
          </Collapsible>
        )}
      </form>
    </SectionContainer>
  );
}
