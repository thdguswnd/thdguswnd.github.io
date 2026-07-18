import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { RsvpRequest } from '../types';

// FP-04: RSVP 요청 DTO JSON 직렬화 라운드트립 불변식
describe('rsvp serialization', () => {
  const arbRequest: fc.Arbitrary<RsvpRequest> = fc.record({
    name: fc.string({ minLength: 1, maxLength: 20 }),
    side: fc.constantFrom('GROOM', 'BRIDE') as fc.Arbitrary<RsvpRequest['side']>,
    attendance: fc.constant('ATTENDING') as fc.Arbitrary<RsvpRequest['attendance']>,
    adultCount: fc.integer({ min: 1, max: 2 }),
    childCount: fc.integer({ min: 0, max: 2 }),
    mealOption: fc.constantFrom(
      'WILL_EAT',
      'WILL_NOT_EAT',
      'UNDECIDED',
    ) as fc.Arbitrary<RsvpRequest['mealOption']>,
  });

  it('serialize→deserialize 는 필드를 보존', () => {
    fc.assert(
      fc.property(arbRequest, (original) => {
        const restored = JSON.parse(JSON.stringify(original)) as RsvpRequest;
        expect(restored).toEqual(original);
      }),
    );
  });
});
