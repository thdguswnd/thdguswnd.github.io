import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 설정. 완전 정적 배포(RSVP는 Google Apps Script로 직접 전송하므로 /api 프록시 불필요).
// base 는 기본값 '/' — GitHub Pages 사용자 페이지(<username>.github.io) 또는 커스텀 도메인(루트 서빙) 기준.
// 이미지는 `yarn optimize:images`(로컬 sharp)로 미리 webp 최적화 → 빌드는 정적 자산만 번들(네이티브 의존성 없음).
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
