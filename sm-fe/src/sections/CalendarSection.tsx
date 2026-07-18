import { useEffect, useState } from 'react';
import { useContent } from '../content/ContentProvider';
import { SectionContainer } from '../components/SectionContainer';
import { LabelDivider } from '../components/LabelDivider';
import { buildMonthGrid, isWeddingDay } from '../lib/calendar';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const WEEKDAY_FULL = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
const RED = '#d9534f';

/** 예식 일시를 "요일 + 오전/오후/낮 H시 M분" 형태로 포맷. */
function formatDateTime(date: Date, time?: string): string {
  const weekday = WEEKDAY_FULL[date.getDay()];
  if (!time) return weekday;
  const [h, m] = time.split(':').map(Number);
  let period: string;
  let hour12: number;
  if (h === 12) {
    period = '낮';
    hour12 = 12;
  } else if (h < 12) {
    period = '오전';
    hour12 = h;
  } else {
    period = '오후';
    hour12 = h - 12;
  }
  const minPart = m ? ` ${m}분` : '';
  return `${weekday} ${period} ${hour12}시${minPart}`;
}

interface Remaining {
  days: number;
  hours: number;
  mins: number;
  secs: number;
}

function computeRemaining(target: number, now: number): Remaining {
  const total = Math.max(0, Math.floor((target - now) / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    mins: Math.floor((total % 3600) / 60),
    secs: total % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** FR-07: 캘린더 + 실시간 카운트다운. 주말/공휴일 붉은색 강조. */
export function CalendarSection() {
  const { calendar } = useContent();
  const [y, mo, d] = calendar.weddingDate.split('-').map(Number);
  const [hh, mm] = (calendar.ceremonyTime ?? '00:00').split(':').map(Number);
  const weddingDate = new Date(y, mo - 1, d);
  const target = new Date(y, mo - 1, d, hh, mm, 0).getTime();

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const rem = computeRemaining(target, now);

  const weeks = buildMonthGrid(y, mo);
  const holidays = new Set(calendar.holidays ?? []);

  function isRed(day: number): boolean {
    const wd = new Date(y, mo - 1, day).getDay();
    const iso = `${y}-${pad(mo)}-${pad(day)}`;
    return wd === 0 || wd === 6 || holidays.has(iso);
  }

  return (
    <SectionContainer id="calendar">
      <LabelDivider text="Wedding Day" />
      {/* 상단 일시 */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: '1.4rem', letterSpacing: '0.05em' }}>
          {y}년 {mo}월 {d}일
        </div>
        <div style={{ color: 'var(--color-muted)', marginTop: 6, fontSize: '0.9rem' }}>
          {formatDateTime(weddingDate, calendar.ceremonyTime)}
        </div>
      </div>

      {/* 달력 */}
      <table
        data-testid="calendar"
        style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse' }}
      >
        <thead>
          <tr>
            {WEEKDAYS.map((w, i) => (
              <th
                key={w}
                style={{ padding: '10px 0', fontSize: '0.85rem', color: i === 0 || i === 6 ? RED : 'var(--color-muted)' }}
              >
                {w}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((cell, ci) => {
                if (cell.day === null) {
                  return <td key={ci} style={{ padding: '8px 0' }} />;
                }
                const highlight = isWeddingDay(cell, weddingDate);
                const red = isRed(cell.day);
                return (
                  <td key={ci} style={{ padding: '6px 0' }}>
                    <span
                      data-testid={highlight ? 'wedding-day' : undefined}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: highlight ? 'var(--color-accent)' : 'transparent',
                        color: highlight ? '#fff' : red ? RED : 'inherit',
                        fontWeight: highlight ? 600 : 400,
                      }}
                    >
                      {cell.day}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* 실시간 카운트다운 */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, color: 'var(--color-muted)', fontSize: '0.7rem', letterSpacing: '0.1em' }}>
          <span>DAYS</span>
          <span>HOUR</span>
          <span>MIN</span>
          <span>SEC</span>
        </div>
        <div data-testid="dday-counter" style={{ display: 'flex', justifyContent: 'center', gap: 12, fontSize: '1.3rem', marginTop: 4 }}>
          <span>{rem.days}</span>
          <span style={{ color: 'var(--color-muted)' }}>:</span>
          <span>{pad(rem.hours)}</span>
          <span style={{ color: 'var(--color-muted)' }}>:</span>
          <span>{pad(rem.mins)}</span>
          <span style={{ color: 'var(--color-muted)' }}>:</span>
          <span>{pad(rem.secs)}</span>
        </div>
      </div>
    </SectionContainer>
  );
}
