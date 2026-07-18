import { useState, type ReactNode } from 'react';
import { SectionContainer } from '../components/SectionContainer';
import { useRsvpSubmit } from '../hooks/useRsvpSubmit';
import type { Attendance, MealOption, RsvpRequest, Side } from '../lib/types';

const ACCENT = 'var(--color-accent)';
const LINE = '#e0d8ce';

/** 선택형 큰 버튼(가능/불가, 식사함/식사안함) — 라운드 박스 + 체크 표시. */
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
  max = Number.MAX_SAFE_INTEGER,
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
const req = <span style={{ color: '#d9534f', marginRight: 4 }}>*</span>;

/** FR-09: 참석 의사(RSVP) 폼. */
export function RsvpSection() {
  const { state, message, submit } = useRsvpSubmit();

  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [name, setName] = useState('');
  const [side, setSide] = useState<Side>('GROOM');
  const [adultCount, setAdultCount] = useState(1); // 대인 인원(0~2), 초기 1
  const [childCount, setChildCount] = useState(0); // 어린이(6~12세) 0~3

  const attending = attendance === 'ATTENDING';
  const selected = attendance !== null; // 가능/불가 중 하나 선택됨
  // 대인 인원 값에 따라 아이콘/문구 변경
  const adultLabel =
    adultCount === 0 ? '🍽️ 밥 안 먹니' : adultCount === 1 ? '🧍 혼자 왔니' : '👫 같이 오니';
  const canSubmit = name.trim() !== '';
  const guardMessage = !name.trim() ? '성함을 입력해주세요.' : '';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !attendance) return;
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
            onClick={() => setAttendance('ATTENDING')}
            label="가능"
            icon="🎉"
          />
          <ChoiceBox
            testId="rsvp-attendance-no"
            selected={attendance === 'NOT_ATTENDING'}
            onClick={() => setAttendance('NOT_ATTENDING')}
            label="불가"
            icon="🙏"
          />
        </div>

        {/* 가능/불가 선택 전에는 이하 항목 숨김 */}
        {selected && (
          <>
        {/* 성함 (+ 신랑측/신부측) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={labelStyle} htmlFor="rsvp-name">
              성함
            </label>
            {selected && (
              <div style={{ display: 'flex', gap: 12, fontSize: '0.85rem' }}>
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
            )}
          </div>
          <input
            id="rsvp-name"
            data-testid="rsvp-name"
            style={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="성함을 입력해 주세요."
          />
        </div>

        {/* 식사 여부 (가능일 때만) */}
        {attending && (
          <div>
            <label style={labelStyle}>{req}식사 여부</label>
            <div style={{ borderTop: `1px solid ${LINE}` }}>
              <Stepper
                label={adultLabel}
                value={adultCount}
                onChange={setAdultCount}
                testId="rsvp-adult"
                min={0}
                max={2}
              />
              {/* 대인 1명 이상일 때만 어린이 행 표시 */}
              {adultCount > 0 && (
                <div style={{ borderTop: `1px solid ${LINE}` }}>
                  <Stepper
                    label="👶 어린이도 오니 (6~12세)"
                    value={childCount}
                    onChange={setChildCount}
                    testId="rsvp-child"
                    min={0}
                    max={3}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 개인정보 안내 (동의 체크박스 대체) */}
        <p
          data-testid="rsvp-privacy-notice"
          style={{ fontSize: '0.78rem', color: 'var(--color-muted)', lineHeight: 1.5, margin: 0, textAlign: 'center' }}
        >
          입력하신 성함은 식사·참석 인원 확인 목적으로만 사용되며,
          <br />
          예식 종료 후 한 달 이내에 모두 삭제됩니다.
        </p>

        {/* 전달 버튼 + 안내 메시지 (닫는 조건부 래퍼는 이 블록 뒤) */}
        <div>
          <button
            type="submit"
            data-testid="rsvp-submit"
            disabled={!canSubmit || state === 'submitting'}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 10,
              border: 'none',
              background: canSubmit ? ACCENT : '#e5ddd4',
              color: canSubmit ? '#fff' : '#a99',
              fontSize: '0.95rem',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
            }}
          >
            {state === 'submitting' ? '전송 중...' : '신랑 & 신부에게 전달하기'}
          </button>
          {!canSubmit && guardMessage && (
            <p data-testid="rsvp-guard" style={{ textAlign: 'center', color: '#d9534f', fontSize: '0.82rem', marginTop: 8 }}>
              {guardMessage}
            </p>
          )}
          {message && (
            <p
              data-testid="rsvp-message"
              style={{ textAlign: 'center', color: state === 'success' ? 'green' : 'crimson', marginTop: 8 }}
            >
              {message}
            </p>
          )}
        </div>
          </>
        )}
      </form>
    </SectionContainer>
  );
}
