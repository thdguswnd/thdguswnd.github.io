// 세트별 폰트 설정. 현재 URL 세트에 따라 폰트를 로드하고 --font-family 변수로 전체 적용.
// 새 폰트를 쓰려면 아래 FONTS 에 세트명과 { family, googleUrl } 을 추가/수정하면 된다.
// googleUrl 은 Google Fonts 링크(https://fonts.google.com 에서 폰트 선택 → embed 의 href). 시스템 폰트면 생략.

export interface FontDef {
  family: string; // CSS font-family 값
  googleUrl?: string; // Google Fonts 스타일시트 URL (웹폰트일 때)
}

const SYSTEM_STACK = "'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";

const FONTS: Record<string, FontDef> = {
  // 기본 세트: 현재 시스템 고딕(변화 없음)
  default: {
//    family: SYSTEM_STACK
    family: `'Grandiflora One', ${SYSTEM_STACK}`,
    googleUrl: 'https://fonts.googleapis.com/css2?family=Grandiflora+One&display=swap',
//    family: `'Bagel Fat One', ${SYSTEM_STACK}`,
//    googleUrl: 'https://fonts.googleapis.com/css2?family=Bagel+Fat+One&display=swap',
//    family: `'Gasoek One', ${SYSTEM_STACK}`,
//    googleUrl: 'https://fonts.googleapis.com/css2?family=Gasoek+One&display=swap',
//    family: `'Moirai One', ${SYSTEM_STACK}`,
//    googleUrl: 'https://fonts.googleapis.com/css2?family=Moirai+One&display=swap',
//    family: `'Diphylleia', ${SYSTEM_STACK}`,
//    googleUrl: 'https://fonts.googleapis.com/css2?family=Diphylleia&display=swap',
  },
  // paints 세트: 명조체(데모). 원하는 폰트로 교체 가능.
  paints: {
    family: `'Gamja Flower', ${SYSTEM_STACK}`,
    googleUrl: 'https://fonts.googleapis.com/css2?family=Gamja+Flower&display=swap',
  },
};

/** 현재 세트의 폰트를 로드하고 :root 의 --font-family 에 적용. */
export function applyFont(set: string): void {
  const def = FONTS[set] ?? FONTS.default;
  if (def.googleUrl && !document.querySelector(`link[data-font-set="${set}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = def.googleUrl;
    link.setAttribute('data-font-set', set);
    document.head.appendChild(link);
  }
  document.documentElement.style.setProperty('--font-family', def.family);
}
