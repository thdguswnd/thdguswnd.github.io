import { useState } from 'react';
import { useContent } from '../content/ContentProvider';
import { ScrollReveal } from '../components/ScrollReveal';
import { KakaoMap } from '../components/KakaoMap';
import { Modal } from '../components/Modal';
import type { AppLink } from '../content/types';

/** 앱 미설치 시 웹으로 폴백하는 링크 열기 (deep link + web fallback). */
function openWithFallback(link: AppLink) {
  const timeout = setTimeout(() => {
    window.location.href = link.webUrl;
  }, 800);
  const cancel = () => clearTimeout(timeout);
  window.addEventListener('pagehide', cancel, { once: true });
  window.location.href = link.deepLink;
}

const navBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid #e0d8ce',
  background: '#fff',
  cursor: 'pointer',
  fontSize: '0.85rem',
} as const;

/** FR-08: 오시는 길 (LOCATION 헤더, 네이버 지도, 약도 PDF 보기, 내비 앱 링크). */
export function DirectionsSection() {
  const { directions } = useContent();
  const { appLinks } = directions;
  const [showPdf, setShowPdf] = useState(false);

  return (
    <ScrollReveal id="directions">
      {/* 헤더 */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ letterSpacing: '0.2em', fontSize: '0.72rem', color: 'var(--color-accent)' }}>LOCATION</div>
        <h2 style={{ color: 'var(--color-accent)', fontWeight: 500, marginTop: 6 }}>오시는 길</h2>
      </div>

      {/* 장소 정보 */}
      <div style={{ textAlign: 'center', marginBottom: 16 }} data-testid="directions">
        <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>{directions.venueName}</div>
        <div style={{ color: 'var(--color-muted)', marginTop: 6 }}>{directions.address}</div>
        {directions.tel && <div style={{ marginTop: 8 }}>Tel. {directions.tel}</div>}
      </div>

      {/* 카카오 지도 */}
      <KakaoMap
        appkey={directions.kakaoJsKey}
        lat={directions.lat ?? 37.5665}
        lng={directions.lng ?? 126.978}
      />

      {/* 약도 이미지 보기 */}
      {directions.sketchMapPdf && (
        <button
          type="button"
          data-testid="sketch-open"
          onClick={() => setShowPdf(true)}
          style={{
            width: '100%',
            marginTop: 12,
            padding: '12px',
            borderRadius: 10,
            border: '1px solid #e0d8ce',
            background: '#fff',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          🗺️ 약도 이미지 보기
        </button>
      )}

      {/* 내비게이션 */}
      <div style={{ marginTop: 28 }}>
        <h3 style={{ fontSize: '1rem', marginBottom: 6 }}>내비게이션</h3>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginBottom: 12 }}>
          원하시는 앱을 선택하시면 길안내가 시작됩니다.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {appLinks.naver && (
            <button data-testid="map-naver" style={navBtn} onClick={() => openWithFallback(appLinks.naver!)}>
              🟢 네이버지도
            </button>
          )}
          {appLinks.tmap && (
            <button data-testid="map-tmap" style={navBtn} onClick={() => openWithFallback(appLinks.tmap!)}>
              🟣 티맵
            </button>
          )}
          {appLinks.kakaoNavi && (
            <button data-testid="map-kakao" style={navBtn} onClick={() => openWithFallback(appLinks.kakaoNavi!)}>
              🟡 카카오내비
            </button>
          )}
        </div>
        {directions.parking && (
          <p style={{ fontSize: '0.82rem', color: 'var(--color-muted)', textAlign: 'center', marginTop: 14 }}>
            주차 안내: {directions.parking}
          </p>
        )}
      </div>

      {/* 약도 PDF 모달 */}
      {showPdf && (
        <Modal title="약도" onClose={() => setShowPdf(false)}>
          <iframe
            src={directions.sketchMapPdf}
            title="약도"
            data-testid="sketch-pdf"
            style={{ width: '100%', height: '70vh', border: 'none' }}
          />
          <p style={{ textAlign: 'center', marginTop: 8 }}>
            <a href={directions.sketchMapPdf} target="_blank" rel="noopener noreferrer">
              새 창에서 열기
            </a>
          </p>
        </Modal>
      )}
    </ScrollReveal>
  );
}
