import { useEffect, useRef, useState } from 'react';
import endImage from '../assets/end.webp';

/**
 * 청첩장 마지막 마무리 이미지.
 *
 * - end.webp 는 신부가 달려가 신랑에게 안기는 3컷 세로 스토리보드다.
 *   잘라내면 이야기 흐름이 끊기므로 원본 비율(4:5)로 전체를 보여준다.
 * - 히어로 상단 사진과 동일하게 좌우 여백 없이 화면 폭을 꽉 채운다(full bleed).
 *   그래서 .section(padding 48px 24px)을 쓰지 않고 직접 section 을 구성한다.
 * - '마음 전하실 곳' 계좌 박스 바로 아래에 붙도록 위쪽 여백을 최소화한다.
 */
export function ClosingSection() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  // 다른 섹션과 동일한 1회 fade-in
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="closing"
      ref={ref}
      data-testid="closing-section"
      style={{
        padding: 0, // 좌우 여백 없음 = 화면 폭 꽉 채움
        margin: 0,
        marginTop: 4, // 계좌 박스 바로 아래
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease',
        lineHeight: 0, // img 아래 인라인 여백 제거
      }}
    >
      <img
        src={endImage}
        alt="신랑과 신부가 마주 보고 달려가 안기는 순간"
        loading="lazy"
        decoding="async"
        width={1600}
        height={2000}
        style={{
          width: '100%',
          height: 'auto', // 원본 비율 유지 = 잘림 없음
          display: 'block',
          // 라운드 코너·클리핑 없음 (히어로 상단 사진과 동일하게 각진 풀블리드)
          borderRadius: 0,
        }}
      />
    </section>
  );
}
