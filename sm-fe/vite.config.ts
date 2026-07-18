import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 설정. 완전 정적 배포(RSVP는 Google Apps Script로 직접 전송하므로 /api 프록시 불필요).
// base 는 기본값 '/' — GitHub Pages 사용자 페이지(<username>.github.io) 또는 커스텀 도메인(루트 서빙) 기준.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
