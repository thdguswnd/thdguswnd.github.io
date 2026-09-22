import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import { applyFont } from './lib/fonts';
import { initStableViewportHeight } from './lib/viewport';

// 폰트를 렌더 전에 적용.
applyFont();

// 주소창/인앱 툴바 토글로 뷰포트 높이가 튀는 것을 막기 위해 --app-height 를 고정.
initStableViewportHeight();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
