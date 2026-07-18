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
    expect(screen.queryByTestId('rsvp-submit')).not.toBeInTheDocument();
  });

  it('가능 선택 시 성함/측/대인·어린이/안내문구/버튼이 보인다 (초기 대인 1)', async () => {
    render(<RsvpSection />);
    await userEvent.click(screen.getByTestId('rsvp-attendance-yes'));
    expect(screen.getByTestId('rsvp-name')).toBeInTheDocument();
    expect(screen.queryByTestId('rsvp-contact')).not.toBeInTheDocument(); // 연락처 미수집
    expect(screen.getByTestId('rsvp-side-groom')).toBeInTheDocument();
    expect(screen.getByTestId('rsvp-adult')).toHaveTextContent('1'); // 초기값 1
    expect(screen.getByTestId('rsvp-child')).toBeInTheDocument(); // 대인>=1 이라 표시
    expect(screen.getByTestId('rsvp-privacy-notice')).toBeInTheDocument();
    expect(screen.queryByTestId('rsvp-consent')).not.toBeInTheDocument(); // 동의 체크박스 제거
    expect(screen.getByTestId('rsvp-submit')).toBeInTheDocument();
  });

  it('불가 선택 시 성함/측/안내문구/버튼은 보이고 식사여부는 숨겨진다', async () => {
    render(<RsvpSection />);
    await userEvent.click(screen.getByTestId('rsvp-attendance-no'));
    expect(screen.getByTestId('rsvp-name')).toBeInTheDocument();
    expect(screen.getByTestId('rsvp-side-groom')).toBeInTheDocument();
    expect(screen.getByTestId('rsvp-privacy-notice')).toBeInTheDocument();
    expect(screen.getByTestId('rsvp-submit')).toBeInTheDocument();
    expect(screen.queryByTestId('rsvp-adult')).not.toBeInTheDocument();
  });

  it('대인 스테퍼는 0~2 범위 (초기 1)', async () => {
    render(<RsvpSection />);
    await userEvent.click(screen.getByTestId('rsvp-attendance-yes'));
    expect(screen.getByTestId('rsvp-adult')).toHaveTextContent('1');
    await userEvent.click(screen.getByTestId('rsvp-adult-inc'));
    expect(screen.getByTestId('rsvp-adult')).toHaveTextContent('2');
    await userEvent.click(screen.getByTestId('rsvp-adult-inc')); // 상한 2
    expect(screen.getByTestId('rsvp-adult')).toHaveTextContent('2');
    await userEvent.click(screen.getByTestId('rsvp-adult-dec'));
    await userEvent.click(screen.getByTestId('rsvp-adult-dec'));
    expect(screen.getByTestId('rsvp-adult')).toHaveTextContent('0');
  });

  it('대인 0명이면 어린이 행이 사라진다', async () => {
    render(<RsvpSection />);
    await userEvent.click(screen.getByTestId('rsvp-attendance-yes'));
    expect(screen.getByTestId('rsvp-child')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('rsvp-adult-dec')); // 1 -> 0
    expect(screen.queryByTestId('rsvp-child')).not.toBeInTheDocument();
  });

  it('어린이 스테퍼는 0~3 범위', async () => {
    render(<RsvpSection />);
    await userEvent.click(screen.getByTestId('rsvp-attendance-yes'));
    expect(screen.getByTestId('rsvp-child')).toHaveTextContent('0');
    for (let i = 0; i < 5; i++) {
      await userEvent.click(screen.getByTestId('rsvp-child-inc'));
    }
    expect(screen.getByTestId('rsvp-child')).toHaveTextContent('3'); // 상한 3
  });

  it('전달 버튼은 성함이 입력되면 활성화된다', async () => {
    render(<RsvpSection />);
    await userEvent.click(screen.getByTestId('rsvp-attendance-yes'));
    const submit = screen.getByTestId('rsvp-submit');
    expect(submit).toBeDisabled();
    expect(screen.getByTestId('rsvp-guard')).toHaveTextContent('성함을 입력해주세요.');
    await userEvent.type(screen.getByTestId('rsvp-name'), '홍길동');
    expect(submit).toBeEnabled();
  });
});
