// 전체 폰트 설정. 테마를 default 하나로 통합했으므로 세트별 분기는 없다.
// 폰트를 바꾸려면 아래 FONT 의 { family, googleUrl } 을 수정하면 된다.
// googleUrl 은 Google Fonts 링크(https://fonts.google.com 에서 폰트 선택 → embed 의 href). 시스템 폰트면 생략.

export interface FontDef {
  family: string; // CSS font-family 값
  googleUrl?: string; // Google Fonts 스타일시트 URL (웹폰트일 때)
}

const SYSTEM_STACK = "'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";

// 후보 폰트(교체용 메모)
//   family: SYSTEM_STACK
//   family: `'Grandiflora One', ${SYSTEM_STACK}`, googleUrl: 'https://fonts.googleapis.com/css2?family=Grandiflora+One&display=swap'
//   family: `'Bagel Fat One', ${SYSTEM_STACK}`,  googleUrl: 'https://fonts.googleapis.com/css2?family=Bagel+Fat+One&display=swap'
//   family: `'Gasoek One', ${SYSTEM_STACK}`,     googleUrl: 'https://fonts.googleapis.com/css2?family=Gasoek+One&display=swap'
//   family: `'Moirai One', ${SYSTEM_STACK}`,     googleUrl: 'https://fonts.googleapis.com/css2?family=Moirai+One&display=swap'
//   family: `'Gamja Flower', ${SYSTEM_STACK}`,   googleUrl: 'https://fonts.googleapis.com/css2?family=Gamja+Flower&display=swap'
const FONT: FontDef = {
  family: `'Diphylleia', ${SYSTEM_STACK}`,
  googleUrl: 'https://fonts.googleapis.com/css2?family=Diphylleia&display=swap',
};

/** 폰트를 로드하고 :root 의 --font-family 에 적용. */
export function applyFont(): void {
  if (FONT.googleUrl && !document.querySelector('link[data-app-font]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONT.googleUrl;
    link.setAttribute('data-app-font', '');
    document.head.appendChild(link);
  }
  document.documentElement.style.setProperty('--font-family', FONT.family);
}
