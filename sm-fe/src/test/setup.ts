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
