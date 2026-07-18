import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

/** 최상위 렌더 오류 격리(전체 백지화 방지). */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 콘솔 로깅(운영 관측성 연동 지점)
    console.error('Render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="section" data-testid="error-boundary-fallback">
          <p style={{ textAlign: 'center' }}>페이지를 표시하는 중 문제가 발생했습니다.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
