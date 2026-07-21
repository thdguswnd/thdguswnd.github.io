import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import { currentSet } from './lib/imageSets';
import { applyFont } from './lib/fonts';

// 현재 URL 세트의 폰트를 렌더 전에 적용(세트별 폰트).
applyFont(currentSet());

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
