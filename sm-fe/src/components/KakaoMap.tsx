import { useEffect, useRef, useState } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    kakao?: any;
  }
}

let loaderPromise: Promise<void> | null = null;

/**
 * Kakao Maps SDK 동적 로드. autoload=false 로 불러온 뒤 kakao.maps.load() 콜백에서 준비 완료를 보장한다.
 */
function loadKakaoMaps(appkey: string): Promise<void> {
  if (window.kakao?.maps) return Promise.resolve();
  if (loaderPromise) return loaderPromise;
  loaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    // 상대 프로토콜(//) 사용: http/https 환경 자동 대응
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&autoload=false`;
    script.async = true;
    script.onload = () => {
      if (window.kakao?.maps) {
        window.kakao.maps.load(() => resolve());
      } else {
        reject(new Error('Kakao Maps SDK 사용 불가'));
      }
    };
    script.onerror = () => reject(new Error('Kakao Maps 로드 실패'));
    document.head.appendChild(script);
  });
  return loaderPromise;
}

/** 카카오 지도(인터랙티브). appkey(JavaScript 키) 미설정 시 안내 플레이스홀더로 폴백. */
export function KakaoMap({
  appkey,
  lat,
  lng,
  level = 3,
  height = 220,
}: {
  appkey?: string;
  lat: number;
  lng: number;
  level?: number;
  height?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'nokey' | 'error'>('loading');

  useEffect(() => {
    if (!appkey) {
      setStatus('nokey');
      return;
    }
    let cancelled = false;
    loadKakaoMaps(appkey)
      .then(() => {
        if (cancelled || !ref.current || !window.kakao?.maps) return;
        const center = new window.kakao.maps.LatLng(lat, lng);
        const map = new window.kakao.maps.Map(ref.current, { center, level });
        // eslint-disable-next-line no-new
        new window.kakao.maps.Marker({ position: center, map });
        setStatus('ok');
      })
      .catch(() => !cancelled && setStatus('error'));
    return () => {
      cancelled = true;
    };
  }, [appkey, lat, lng, level]);

  if (status === 'nokey' || status === 'error') {
    return (
      <div
        data-testid="kakao-map-fallback"
        style={{
          height,
          borderRadius: 8,
          background: '#f2ede6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: 'var(--color-muted)',
          fontSize: '0.82rem',
          padding: 12,
        }}
      >
        {status === 'error'
          ? '지도를 불러오지 못했습니다. (도메인 등록/키 확인)'
          : '카카오맵 JavaScript 키를 설정하면 지도가 표시됩니다.'}
      </div>
    );
  }

  return <div ref={ref} data-testid="kakao-map" style={{ height, borderRadius: 8, overflow: 'hidden' }} />;
}
