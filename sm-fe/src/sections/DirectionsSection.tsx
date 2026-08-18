import { useState } from 'react';
import { useContent } from '../content/ContentProvider';
import { ScrollReveal } from '../components/ScrollReveal';
import { KakaoMap } from '../components/KakaoMap';
import { Modal } from '../components/Modal';
import { LabelDivider } from '../components/LabelDivider';
import { SmartImage } from '../components/SmartImage';
import type { AppLink } from '../content/types';
import naverIcon from '../assets/nav-icons/navermap.png';
import tmapIcon from '../assets/nav-icons/tmap.png';
import kakaoNaviIcon from '../assets/nav-icons/kakaonavi.png';

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
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 6,
  padding: '12px 4px',
  borderRadius: 10,
  border: '1px solid #e0d8ce',
  background: '#fff',
  cursor: 'pointer',
  fontSize: '0.8rem',
} as const;

const navIconStyle = { width: 38, height: 38, display: 'block', borderRadius: 8 } as const;

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

      {/* 카카오 지도 (터치로 이동/확대 가능). 핀 말풍선은 식장명만 짧게 표시 */}
      <KakaoMap
        appkey={directions.kakaoJsKey}
        address={directions.mapQuery ?? directions.address}
        venueName={directions.venueName.split(' ')[0]}
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

      {/* 내비게이션 앱 버튼 (실제 앱 아이콘, 줄바꿈 없이 가로 꽉 차게) */}
      <div style={{ marginTop: 10 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap' }}>
          {appLinks.naver && (
            <button data-testid="map-naver" style={navBtn} onClick={() => openWithFallback(appLinks.naver!)}>
              <img src={naverIcon} alt="" style={navIconStyle} />
              네이버지도
            </button>
          )}
          {appLinks.tmap && (
            <button data-testid="map-tmap" style={navBtn} onClick={() => openWithFallback(appLinks.tmap!)}>
              <img src={tmapIcon} alt="" style={navIconStyle} />
              티맵
            </button>
          )}
          {appLinks.kakaoNavi && (
            <button data-testid="map-kakao" style={navBtn} onClick={() => openWithFallback(appLinks.kakaoNavi!)}>
              <img src={kakaoNaviIcon} alt="" style={navIconStyle} />
              카카오내비
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
