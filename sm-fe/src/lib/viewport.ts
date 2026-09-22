/**
 * 모바일 뷰포트 높이 안정화.
 *
 * 문제
 *  - 모바일 Chrome 은 스크롤 시 주소창이 접히며 `window.innerHeight` 가 커진다.
 *    이때 `100vh` / `100dvh` 로 잡은 요소는 높이가 변하고, 그 안의
 *    `background-size: cover` 가 재계산되어 사진이 확대/축소된다.
 *  - 카카오톡 인앱 브라우저는 상·하단 툴바가 스크롤에 따라 나타나고 사라져
 *    레이아웃 높이가 더 자주 튄다.
 *
 * 해결
 *  - 높이를 CSS 변수 `--app-height` 에 px 로 고정해두고 CSS 가 그 값을 쓰게 한다.
 *  - 주소창/툴바 토글은 '세로 높이만' 바뀐다. 따라서 가로폭이 그대로면 무시하고,
 *    화면 회전처럼 가로폭이 변한 경우에만 다시 계산한다.
 *    → 스크롤 중에는 값이 절대 바뀌지 않으므로 배율 변동도, 레이아웃 점프도 없다.
 */
const VAR = '--app-height';

function apply(height: number): void {
  document.documentElement.style.setProperty(VAR, `${height}px`);
}

/** `--app-height` 를 설정하고 회전 시에만 갱신하도록 리스너를 등록한다. */
export function initStableViewportHeight(): void {
  let lastWidth = window.innerWidth;
  apply(window.innerHeight);

  const recalcIfWidthChanged = () => {
    // 가로폭이 같다면 주소창/툴바 토글로 인한 높이 변화 → 무시
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    apply(window.innerHeight);
  };

  window.addEventListener('resize', recalcIfWidthChanged);

  // 회전은 resize 보다 늦게 최종 크기가 확정되는 기기가 있어 한 박자 뒤에 재적용
  window.addEventListener('orientationchange', () => {
    window.setTimeout(() => {
      lastWidth = window.innerWidth;
      apply(window.innerHeight);
    }, 300);
  });
}
