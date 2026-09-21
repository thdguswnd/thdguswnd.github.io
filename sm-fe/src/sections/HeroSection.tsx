import { useEffect, type CSSProperties } from 'react';
import { useContent } from '../content/ContentProvider';
import { GREEN_PALETTE, applyPalette } from '../lib/theme';
import { heroImage } from '../lib/images';

const SHADOW = '0 1px 8px rgba(0, 0, 0, 0.5)';

/** 배경 사진 위 절대위치 레이어 공통 스타일. */
function layer(extra: CSSProperties): CSSProperties {
  return {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    color: '#fff',
    textShadow: SHADOW,
    whiteSpace: 'nowrap',
    ...extra,
  };
}

/** FR-01: 메인(포스터형). 배경 사진 위에 환영 메시지·신랑/신부·날짜를 포스터처럼 배치. 이미지 key color 로 테마 설정. */
export function HeroSection() {
  const { main, greeting, calendar } = useContent();
  const heroSrc = heroImage;

  // 은은한 초록 테마 적용.
  // (사진에서 색을 추출하면 현재 메인 사진은 하늘색 비중이 커서 청회색이 나오므로 고정값 사용)
  useEffect(() => {
    applyPalette(GREEN_PALETTE);
  }, []);

  const dateStr = calendar.weddingDate.replace(/-/g, '.'); // 2026.11.15

  return (
    <section
      className="section is-visible hero-full"
      data-testid="hero-section"
      style={{
        padding: 0,
        color: '#fff',
      }}
    >
      {/* 배경 사진. 스크롤 시 주소창 접힘으로 인한 확대를 막기 위해 별도 레이어로 분리(.hero-bg) */}
      <div className="hero-bg" style={{ backgroundImage: `url(${heroSrc})` }} aria-hidden />

      {/* 상단: 환영 메시지(크게) */}
      <div style={layer({ top: '19%', left: '50%', width: '88%', whiteSpace: 'normal' })}>
        <div style={{ fontWeight: 400, letterSpacing: '0.05em', lineHeight: 1.35 }}>
          <div style={{ fontSize: '2.4rem' }}>{main.title}</div>
          {main.titleSecondary && <div style={{ fontSize: '1.8rem' }}>{main.titleSecondary}</div>}
        </div>
      </div>

      {/* 신랑(가로 1/5) · 신부(가로 4/5) */}
      <div style={layer({ top: '61%', left: '20%', fontSize: '1.4rem', letterSpacing: '0.12em' })}>
        {greeting.groom.name}
      </div>
      <div style={layer({ top: '61%', left: '80%', fontSize: '1.4rem', letterSpacing: '0.12em' })}>
        {greeting.bride.name}
      </div>

      {/* 일시·장소 (원래 86.5/91.5 기준 +1.5%) */}
      <div style={layer({ top: '88%', left: '50%', fontSize: '1.05rem', letterSpacing: '0.18em' })}>
        {dateStr}
      </div>
      <div style={layer({ top: '93%', left: '50%', fontSize: '1.2rem', letterSpacing: '0.1em' })}>
        로프트가든344
      </div>
    </section>
  );
}
