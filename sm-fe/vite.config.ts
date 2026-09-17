import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// 빌드 후처리 플러그인.
// - 루트(/)는 기본 청첩장(React) 을 그대로 서빙 → thdguswnd.github.io 접속 시 청첩장
// - 같은 HTML 을 404.html(SPA 폴백) / /invite/ 에도 복사 (기존 공유 링크 유지)
// - 게임은 '/game/' 에 정적 배포됨(public/game). 옛 주소 '/pokemon' 은 '/game/' 로 리다이렉트.
function emitPages() {
  return {
    name: 'emit-pages',
    closeBundle() {
      const dist = 'dist';
      const indexPath = join(dist, 'index.html');
      if (!existsSync(indexPath)) return;
      const html = readFileSync(indexPath, 'utf-8'); // 기본 청첩장 HTML
      // SPA 폴백
      writeFileSync(join(dist, '404.html'), html);
      // 기본 청첩장을 /invite/ 에도 배치 (base '/' 라 절대경로 자산이 어디서든 동작)
      mkdirSync(join(dist, 'invite'), { recursive: true });
      writeFileSync(join(dist, 'invite', 'index.html'), html);
      // 루트(/) 는 dist/index.html 그대로 = 청첩장. (덮어쓰지 않음)
      // 옛 게임 주소(/pokemon) → /game/ 리다이렉트 (이전에 공유된 링크 대비)
      const redirect =
        '<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1">' +
        '<meta http-equiv="refresh" content="0; url=/game/">' +
        '<title>이동 중…</title>' +
        '<script>location.replace("/game/");</script></head><body></body></html>';
      mkdirSync(join(dist, 'pokemon'), { recursive: true });
      writeFileSync(join(dist, 'pokemon', 'index.html'), redirect);
    },
  };
}

// Vite 설정. 완전 정적 배포(RSVP는 Google Apps Script로 직접 전송하므로 /api 프록시 불필요).
// base 는 기본값 '/' — GitHub Pages 사용자 페이지(<username>.github.io) 또는 커스텀 도메인(루트 서빙) 기준.
// 이미지는 `yarn optimize:images`(로컬 sharp)로 미리 webp 최적화 → 빌드는 정적 자산만 번들(네이티브 의존성 없음).
export default defineConfig({
  plugins: [react(), emitPages()],
  server: {
    port: 5173,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
