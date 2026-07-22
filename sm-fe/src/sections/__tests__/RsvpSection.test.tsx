import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RsvpSection } from '../RsvpSection';

/** 가능 선택 → 신랑측 선택 → 성함 입력 까지 진행 */
async function fillToName(name = '홍길동') {
  await userEvent.click(screen.getByTestId('rsvp-attendance-yes'));
  await userEvent.click(screen.getByTestId('rsvp-side-groom'));
  await userEvent.type(screen.getByTestId('rsvp-name'), name);
}

describe('RsvpSection', () => {
  it('초기(가능/불가 미선택)에는 하위 항목이 모두 숨겨진다', () => {
    render(<RsvpSection />);
    expect(screen.getByTestId('rsvp-attendance-yes')).toBeInTheDocument();
    expect(screen.queryByTestId('rsvp-side-group')).not.toBeInTheDocument();
    expect(screen.queryByTestId('rsvp-name')).not.toBeInTheDocument();
    expect(screen.queryByTestId('rsvp-details')).not.toBeInTheDocument();
  });

  it('가능 선택 시 신랑측/신부측이 미선택 상태로 나타나고, 식사여부/성함은 아직 숨겨진다', async () => {
    render(<RsvpSection />);
    await userEvent.click(screen.getByTestId('rsvp-attendance-yes'));
    expect(screen.getByTestId('rsvp-side-group')).toBeInTheDocument();
    expect(screen.getByTestId('rsvp-side-groom')).not.toBeChecked();
    expect(screen.getByTestId('rsvp-side-bride')).not.toBeChecked();
    expect(screen.queryByTestId('rsvp-adult')).not.toBeInTheDocument();
    expect(screen.queryByTestId('rsvp-name')).not.toBeInTheDocument();
  });

  it('신랑측/신부측을 선택하면 식사여부와 성함 입력이 함께 나타난다', async () => {
    render(<RsvpSection />);
    await userEvent.click(screen.getByTestId('rsvp-attendance-yes'));
    await userEvent.click(screen.getByTestId('rsvp-side-groom'));
    expect(screen.getByTestId('rsvp-adult')).toBeInTheDocument(); // 식사여부
    expect(screen.getByTestId('rsvp-name')).toBeInTheDocument(); // 성함
  });

  it('성함 입력 시 안내문구/전달 버튼이 펼쳐진다', async () => {
    render(<RsvpSection />);
    await fillToName();
    expect(screen.getByTestId('rsvp-details')).toHaveStyle({ opacity: '1' });
    expect(screen.getByTestId('rsvp-privacy-notice')).toBeInTheDocument();
    expect(screen.getByTestId('rsvp-submit')).toBeEnabled();
  });

  it('성함을 지우면 안내문구/버튼이 사라진다', async () => {
    render(<RsvpSection />);
    await fillToName();
    expect(screen.getByTestId('rsvp-details')).toHaveStyle({ opacity: '1' });
    await userEvent.clear(screen.getByTestId('rsvp-name'));
    expect(screen.getByTestId('rsvp-details')).toHaveStyle({ opacity: '0' });
  });

  it('불가 + 측 + 성함 입력 시 식사여부는 없고 전달 버튼이 보인다', async () => {
    render(<RsvpSection />);
    await userEvent.click(screen.getByTestId('rsvp-attendance-no'));
    await userEvent.click(screen.getByTestId('rsvp-side-bride'));
    await userEvent.type(screen.getByTestId('rsvp-name'), '홍길동');
    expect(screen.queryByTestId('rsvp-adult')).not.toBeInTheDocument();
    expect(screen.getByTestId('rsvp-submit')).toBeInTheDocument();
  });

  it('대인 스테퍼는 0~10 범위 (초기 1)', async () => {
    render(<RsvpSection />);
    await fillToName();
    expect(screen.getByTestId('rsvp-adult')).toHaveTextContent('1');
    for (let i = 0; i < 12; i++) await userEvent.click(screen.getByTestId('rsvp-adult-inc'));
    expect(screen.getByTestId('rsvp-adult')).toHaveTextContent('10'); // 상한 10
    for (let i = 0; i < 12; i++) await userEvent.click(screen.getByTestId('rsvp-adult-dec'));
    expect(screen.getByTestId('rsvp-adult')).toHaveTextContent('0'); // 하한 0
  });

  it('대인 0명이면 어린이 행이 사라진다', async () => {
    render(<RsvpSection />);
    await fillToName();
    expect(screen.getByTestId('rsvp-child')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('rsvp-adult-dec')); // 1 -> 0
    expect(screen.queryByTestId('rsvp-child')).not.toBeInTheDocument();
  });

  it('어린이 스테퍼는 0~10 범위', async () => {
    render(<RsvpSection />);
    await fillToName();
    expect(screen.getByTestId('rsvp-child')).toHaveTextContent('0');
    for (let i = 0; i < 12; i++) await userEvent.click(screen.getByTestId('rsvp-child-inc'));
    expect(screen.getByTestId('rsvp-child')).toHaveTextContent('10'); // 상한 10
  });
});
