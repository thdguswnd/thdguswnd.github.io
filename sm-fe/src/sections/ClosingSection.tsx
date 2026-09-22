import { ScrollReveal } from '../components/ScrollReveal';
import endImage from '../assets/end.webp';

/**
 * 청첩장 마지막 마무리 이미지.
 *
 * end.webp 는 신부가 달려가 신랑에게 안기는 3컷 세로 스토리보드다.
 * 잘라내면 이야기 흐름이 끊기므로 크롭 없이 원본 비율(4:5)로 전체를 보여준다.
 * (object-fit: cover 를 쓰지 않는 이유)
 */
export function ClosingSection() {
  return (
    <ScrollReveal id="closing">
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
          borderRadius: 12,
        }}
      />
    </ScrollReveal>
  );
}
