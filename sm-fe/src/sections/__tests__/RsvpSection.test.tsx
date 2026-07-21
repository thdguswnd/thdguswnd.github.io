import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RsvpSection } from '../RsvpSection';

describe('RsvpSection', () => {
  it('초기(가능/불가 미선택)에는 하위 항목이 모두 숨겨진다', () => {
    render(<RsvpSection />);
    expect(screen.getByTestId('rsvp-attendance-yes')).toBeInTheDocument();
    expect(screen.getByTestId('rsvp-attendance-no')).toBeInTheDocument();
    expect(screen.queryByTestId('rsvp-name')).not.toBeInTheDocument();
    expect(screen.queryByTestId('rsvp-details')).not.toBeInTheDocument();
  });

  it('가능 선택 시 성함/측이 보이고, 상세(식사여부/버튼)는 이름 입력 전 접혀 있다', async () => {
    render(<RsvpSection />);
    await userEvent.click(screen.getByTestId('rsvp-attendance-yes'));
    expect(screen.getByTestId('rsvp-name')).toBeInTheDocument();
    expect(screen.getByTestId('rsvp-side-groom')).toBeInTheDocument();
    // 상세 영역은 마운트돼 있으나 접힘(opacity 0)
    expect(screen.getByTestId('rsvp-details')).toHaveStyle({ opacity: '0' });
  });

  it('가능 + 성함 입력 시 상세가 펼쳐지고 식사여부/안내문구/버튼이 보인다', async () => {
    render(<RsvpSection />);
    await userEvent.click(screen.getByTestId('rsvp-attendance-yes'));
    await userEvent.type(screen.getByTestId('rsvp-name'), '홍길동');
    expect(screen.getByTestId('rsvp-details')).toHaveStyle({ opacity: '1' });
    expect(screen.getByTestId('rsvp-adult')).toHaveTextContent('1'); // 초기값 1
    expect(screen.getByTestId('rsvp-child')).toBeInTheDocument();
    expect(screen.getByTestId('rsvp-privacy-notice')).toBeInTheDocument();
    expect(screen.getByTestId('rsvp-submit')).toBeEnabled();
  });

  it('불가 + 성함 입력 시 식사여부는 없고 전달 버튼이 보인다', async () => {
    render(<RsvpSection />);
    await userEvent.click(screen.getByTestId('rsvp-attendance-no'));
    await userEvent.type(screen.getByTestId('rsvp-name'), '홍길동');
    expect(screen.queryByTestId('rsvp-adult')).not.toBeInTheDocument();
    expect(screen.getByTestId('rsvp-submit')).toBeInTheDocument();
  });

  it('대인 스테퍼는 0~10 범위 (초기 1)', async () => {
    render(<RsvpSection />);
    await userEvent.click(screen.getByTestId('rsvp-attendance-yes'));
    await userEvent.type(screen.getByTestId('rsvp-name'), '홍길동');
    expect(screen.getByTestId('rsvp-adult')).toHaveTextContent('1');
    for (let i = 0; i < 12; i++) await userEvent.click(screen.getByTestId('rsvp-adult-inc'));
    expect(screen.getByTestId('rsvp-adult')).toHaveTextContent('10'); // 상한 10
    for (let i = 0; i < 12; i++) await userEvent.click(screen.getByTestId('rsvp-adult-dec'));
    expect(screen.getByTestId('rsvp-adult')).toHaveTextContent('0'); // 하한 0
  });

  it('대인 0명이면 어린이 행이 사라진다', async () => {
    render(<RsvpSection />);
    await userEvent.click(screen.getByTestId('rsvp-attendance-yes'));
    await userEvent.type(screen.getByTestId('rsvp-name'), '홍길동');
    expect(screen.getByTestId('rsvp-child')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('rsvp-adult-dec')); // 1 -> 0
    expect(screen.queryByTestId('rsvp-child')).not.toBeInTheDocument();
  });

  it('어린이 스테퍼는 0~10 범위', async () => {
    render(<RsvpSection />);
    await userEvent.click(screen.getByTestId('rsvp-attendance-yes'));
    await userEvent.type(screen.getByTestId('rsvp-name'), '홍길동');
    expect(screen.getByTestId('rsvp-child')).toHaveTextContent('0');
    for (let i = 0; i < 12; i++) await userEvent.click(screen.getByTestId('rsvp-child-inc'));
    expect(screen.getByTestId('rsvp-child')).toHaveTextContent('10'); // 상한 10
  });
});
