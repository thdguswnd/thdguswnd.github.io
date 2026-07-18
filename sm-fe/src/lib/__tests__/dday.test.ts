import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { daysUntil, formatDday } from '../dday';

describe('dday', () => {
  it('예시: 미래/당일/과거', () => {
    expect(formatDday(100)).toBe('D-100');
    expect(formatDday(0)).toBe('D-DAY');
    expect(formatDday(-3)).toBe('D+3');
  });

  it('daysUntil 예시', () => {
    expect(daysUntil(new Date(2026, 10, 15), new Date(2026, 10, 5))).toBe(10);
  });

  // FP-01: 결정성
  it('formatDday 는 결정적', () => {
    fc.assert(
      fc.property(fc.integer({ min: -1000, max: 1000 }), (d) => {
        expect(formatDday(d)).toBe(formatDday(d));
      }),
    );
  });

  // FP-02: 부호 규칙
  it('formatDday 부호 규칙', () => {
    fc.assert(
      fc.property(fc.integer({ min: -1000, max: 1000 }), (d) => {
        const s = formatDday(d);
        if (d > 0) expect(s.startsWith('D-')).toBe(true);
        else if (d === 0) expect(s).toBe('D-DAY');
        else expect(s.startsWith('D+')).toBe(true);
      }),
    );
  });
});
