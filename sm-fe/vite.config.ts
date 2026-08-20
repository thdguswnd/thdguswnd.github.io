import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// 빌드 후처리 플러그인.
// - dist/index.html(기본 청첩장, React) 을 404.html / /invite/ / 이미지세트 경로에 복사
// - 루트(/)는 게임(/game/)으로 자동 이동(redirect) → thdguswnd.github.io 접속 시 게임형 청첩장
//   ('/game' 은 public/game 에 정적 배포됨. 기본 청첩장은 '/invite' 에서 그대로 접속 가능)
function emitSetPages() {
  return {
    name: 'emit-set-pages',
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
      // 이미지 세트 서브페이지 (기존 동작 유지)
      const setsDir = 'src/assets/sets';
      if (existsSync(setsDir)) {
        for (const name of readdirSync(setsDir)) {
          if (name === 'default') continue;
          const dir = join(dist, name);
          mkdirSync(dir, { recursive: true });
          writeFileSync(join(dir, 'index.html'), html);
        }
      }
      // 게임(/game/)으로 보내는 리다이렉트 페이지
      const redirect =
        '<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1">' +
        '<meta http-equiv="refresh" content="0; url=/game/">' +
        '<title>이동 중…</title>' +
        '<script>location.replace("/game/");</script></head><body></body></html>';
      // 루트(/) → 게임
      writeFileSync(indexPath, redirect);
      // 옛 게임 주소(/pokemon) → 게임 (이전에 공유된 링크 대비)
      mkdirSync(join(dist, 'pokemon'), { recursive: true });
      writeFileSync(join(dist, 'pokemon', 'index.html'), redirect);
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
