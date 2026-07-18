import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { buildMonthGrid } from '../calendar';

describe('calendar', () => {
  it('2026년 11월 그리드: 30일', () => {
    const weeks = buildMonthGrid(2026, 11);
    const inMonth = weeks.flat().filter((c) => c.inMonth);
    expect(inMonth.length).toBe(30);
  });

  // FP-03: 각 주 7칸, inMonth 수 == 해당 월 일수
  it('그리드 불변식', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2000, max: 2100 }),
        fc.integer({ min: 1, max: 12 }),
        (year, month) => {
          const weeks = buildMonthGrid(year, month);
          weeks.forEach((w) => expect(w.length).toBe(7));
          const expectedDays = new Date(year, month, 0).getDate();
          const inMonth = weeks.flat().filter((c) => c.inMonth).length;
          expect(inMonth).toBe(expectedDays);
        },
      ),
    );
  });
});
