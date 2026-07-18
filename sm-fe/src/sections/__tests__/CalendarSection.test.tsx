import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContentProvider } from '../../content/ContentProvider';
import { CalendarSection } from '../CalendarSection';

describe('CalendarSection', () => {
  it('예식일(15일) 강조와 D-Day 카운터를 렌더한다', () => {
    render(
      <ContentProvider>
        <CalendarSection />
      </ContentProvider>,
    );
    expect(screen.getByTestId('calendar')).toBeInTheDocument();
    expect(screen.getByTestId('wedding-day')).toHaveTextContent('15');
    expect(screen.getByTestId('dday-counter')).toBeInTheDocument();
  });
});
