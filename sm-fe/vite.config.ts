import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// 이미지 세트별 경로 페이지 생성 플러그인.
// 빌드 후 dist/index.html 을 dist/<세트명>/index.html 로 복사 → /paints 같은 경로 접속 지원(GitHub Pages 정적).
// 404.html 도 복사 → 알 수 없는 경로도 SPA 로 폴백.
function emitSetPages() {
  return {
    name: 'emit-set-pages',
    closeBundle() {
      const dist = 'dist';
      const indexPath = join(dist, 'index.html');
      if (!existsSync(indexPath)) return;
      const html = readFileSync(indexPath, 'utf-8');
      writeFileSync(join(dist, '404.html'), html);
      const setsDir = 'src/assets/sets';
      if (!existsSync(setsDir)) return;
      for (const name of readdirSync(setsDir)) {
        if (name === 'default') continue;
        const dir = join(dist, name);
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, 'index.html'), html);
      }
    },
  };
}

// Vite 설정. 완전 정적 배포(RSVP는 Google Apps Script로 직접 전송하므로 /api 프록시 불필요).
// base 는 기본값 '/' — GitHub Pages 사용자 페이지(<username>.github.io) 또는 커스텀 도메인(루트 서빙) 기준.
// 이미지는 `yarn optimize:images`(로컬 sharp)로 미리 webp 최적화 → 빌드는 정적 자산만 번들(네이티브 의존성 없음).
export default defineConfig({
  plugins: [react(), emitSetPages()],
  server: {
    port: 5173,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
