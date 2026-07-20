import { useState } from 'react';
import { useContent } from '../content/ContentProvider';
import { ScrollReveal } from '../components/ScrollReveal';
import { KakaoMap } from '../components/KakaoMap';
import { Modal } from '../components/Modal';
import { LabelDivider } from '../components/LabelDivider';
import { SmartImage } from '../components/SmartImage';
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

/** FR-08: 오시는 길 (Location 구분선, 카카오 지도, 오시는 길 약도 이미지, 내비 앱 링크). */
export function DirectionsSection() {
  const { directions } = useContent();
  const { appLinks } = directions;
  const [showMap, setShowMap] = useState(false);

  return (
    <ScrollReveal id="directions">
      {/* 헤더 */}
      <LabelDivider text="Location" />
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h2 style={{ color: 'var(--color-accent)', fontWeight: 500 }}>오시는 길</h2>
      </div>

      {/* 장소 정보 */}
      <div style={{ textAlign: 'center', marginBottom: 16 }} data-testid="directions">
        <div style={{ fontSize: '1.35rem', fontWeight: 600 }}>{directions.venueName}</div>
        <div style={{ color: 'var(--color-muted)', marginTop: 6 }}>{directions.address}</div>
        {directions.tel && <div style={{ marginTop: 8 }}>Tel. {directions.tel}</div>}
      </div>

      {/* 카카오 지도 (주소 지오코딩 → 마커+말풍선, 실패 시 lat/lng 폴백) */}
      <KakaoMap
        appkey={directions.kakaoJsKey}
        address={directions.mapQuery ?? directions.address}
        venueName={directions.venueName}
        lat={directions.lat ?? 37.5665}
        lng={directions.lng ?? 126.978}
      />

      {/* 오시는 길 약도 이미지 보기 */}
      {directions.sketchMapImage && (
        <button
          type="button"
          data-testid="sketch-open"
          onClick={() => setShowMap(true)}
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
          찾아오시는 방법
        </button>
      )}

      {/* 내비게이션 앱 버튼 */}
      <div style={{ marginTop: 28 }}>
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

      {/* 찾아오시는 방법 약도 이미지 모달 (이미지만) */}
      {showMap && (
        <Modal onClose={() => setShowMap(false)}>
          <SmartImage
            src={directions.sketchMapImage}
            alt="찾아오시는 방법"
            style={{ width: '100%', display: 'block', borderRadius: 8 }}
          />
        </Modal>
      )}
    </ScrollReveal>
  );
}
