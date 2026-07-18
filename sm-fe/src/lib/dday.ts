// D-Day 계산 유틸 (순수 함수). PBT 대상 (FP-01/02).

/** 두 날짜의 자정 기준 남은 일수(예식일 - 오늘). 음수면 지난 것. */
export function daysUntil(weddingDate: Date, today: Date): number {
  const w = Date.UTC(weddingDate.getFullYear(), weddingDate.getMonth(), weddingDate.getDate());
  const t = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((w - t) / 86_400_000);
}

/** 남은 일수를 표시 문자열로 변환. days>0 → D-N, 0 → D-DAY, days<0 → D+N. */
export function formatDday(days: number): string {
  if (days > 0) {
    return `D-${days}`;
  }
  if (days === 0) {
    return 'D-DAY';
  }
  return `D+${Math.abs(days)}`;
}
