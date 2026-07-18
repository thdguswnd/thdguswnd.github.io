// 캘린더 그리드 생성 유틸 (순수 함수). PBT 대상 (FP-03).

export interface CalendarCell {
  day: number | null;
  inMonth: boolean;
}

/**
 * 월 달력 그리드를 주 단위(7칸)로 생성.
 *
 * @param year 연도
 * @param month 1~12
 */
export function buildMonthGrid(year: number, month: number): CalendarCell[][] {
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0(일)~6(토)
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: CalendarCell[] = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: null, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: null, inMonth: false });
  }

  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

/** 셀이 예식일인지 여부(강조용). */
export function isWeddingDay(cell: CalendarCell, weddingDate: Date): boolean {
  return cell.inMonth && cell.day === weddingDate.getDate();
}
