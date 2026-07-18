import { useEffect, useRef, useState } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    kakao?: any;
  }
}

let loaderPromise: Promise<void> | null = null;

/**
 * Kakao Maps SDK 동적 로드. 지오코딩(주소→좌표)을 위해 libraries=services 포함.
 * autoload=false 로 불러온 뒤 kakao.maps.load() 콜백에서 준비 완료를 보장한다.
 */
function loadKakaoMaps(appkey: string): Promise<void> {
  if (window.kakao?.maps) return Promise.resolve();
  if (loaderPromise) return loaderPromise;
  loaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    // https 고정 (mixed-content/ORB 방지). 카카오 콘솔에 도메인 등록 필요.
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&libraries=services&autoload=false`;
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

/**
 * 카카오 지도(인터랙티브).
 * - address(도로명 주소)가 있으면 지오코딩으로 위치를 찾아 마커+말풍선 표시.
 * - 지오코딩 실패 시 lat/lng 로 폴백.
 * - appkey 미설정/로드 실패 시 안내 플레이스홀더로 폴백.
 */
export function KakaoMap({
  appkey,
  address,
  venueName,
  lat,
  lng,
  level = 3,
  height = 220,
}: {
  appkey?: string;
  address?: string;
  venueName?: string;
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

    // 지정 좌표에 지도+마커(+말풍선) 렌더
    const render = (kakao: any, latlng: any) => {
      if (cancelled || !ref.current) return;
      const map = new kakao.maps.Map(ref.current, { center: latlng, level });
      // eslint-disable-next-line no-new
      new kakao.maps.Marker({ position: latlng, map });
      if (venueName) {
        new kakao.maps.InfoWindow({
          content: `<div style="padding:5px 10px;font-size:13px;font-weight:600;color:#333;white-space:nowrap;">${venueName}</div>`,
        }).open(map, new kakao.maps.Marker({ position: latlng }));
      }
      map.setCenter(latlng);
      setStatus('ok');
    };

    loadKakaoMaps(appkey)
      .then(() => {
        if (cancelled || !window.kakao?.maps) return;
        const kakao = window.kakao;
        const geocoder = kakao.maps.services?.Geocoder ? new kakao.maps.services.Geocoder() : null;

        if (address && geocoder) {
          // 주소 → 좌표 지오코딩. 실패 시 lat/lng 폴백.
          geocoder.addressSearch(address, (result: any[], geoStatus: string) => {
            if (cancelled) return;
            if (geoStatus === kakao.maps.services.Status.OK && result[0]) {
              render(kakao, new kakao.maps.LatLng(result[0].y, result[0].x));
            } else {
              render(kakao, new kakao.maps.LatLng(lat, lng));
            }
          });
        } else {
          render(kakao, new kakao.maps.LatLng(lat, lng));
        }
      })
      .catch(() => !cancelled && setStatus('error'));

    return () => {
      cancelled = true;
    };
  }, [appkey, address, venueName, lat, lng, level]);

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
