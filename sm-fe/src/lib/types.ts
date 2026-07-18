// RSVP 제출 DTO 타입 (Google Sheets 전송용)

export type Side = 'GROOM' | 'BRIDE';
export type Attendance = 'ATTENDING' | 'NOT_ATTENDING';
export type MealOption = 'WILL_EAT' | 'WILL_NOT_EAT' | 'UNDECIDED';

export interface RsvpRequest {
  name: string;
  side: Side;
  attendance: Attendance;
  adultCount?: number;
  childCount?: number;
  mealOption?: MealOption;
}
