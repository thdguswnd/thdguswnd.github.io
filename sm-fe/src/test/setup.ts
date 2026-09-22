import '@testing-library/jest-dom';

// jsdom 에는 IntersectionObserver 가 없으므로 테스트용 no-op 스텁 제공
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

globalThis.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver;

// jsdom 에는 scrollIntoView 가 구현돼 있지 않아 호출 시 에러 → no-op 스텁
window.HTMLElement.prototype.scrollIntoView = () => {};

// jsdom 에는 matchMedia 가 없다. embla-carousel 이 옵션 처리 단계에서 호출하므로
// 스텁이 없으면 캐러셀이 들어간 컴포넌트 렌더가 "undefined is not a function" 으로 실패한다.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated API 폴백
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

// jsdom 에는 ResizeObserver 도 없다. embla-carousel 의 ResizeHandler 가 사용한다.
if (!globalThis.ResizeObserver) {
  class MockResizeObserver implements ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
}
