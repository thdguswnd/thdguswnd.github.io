import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// 빌드 후처리 플러그인.
// - 루트(/) 접속 시 /game/ 로 리다이렉트
// - 기본 청첩장은 /invite/ 에 배치 및 404.html(SPA 폴백)에 복사
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

      // 기본 청첩장을 /invite/ 에 배치
      mkdirSync(join(dist, 'invite'), { recursive: true });
      writeFileSync(join(dist, 'invite', 'index.html'), html);

      // /game/ 리다이렉트용 HTML
      const redirect =
        '<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1">' +
        '<meta http-equiv="refresh" content="0; url=/game/">' +
        '<title>이동 중…</title>' +
        '<script>location.replace("/game/");</script></head><body></body></html>';

      // 루트(/) 접속 시 바로 /game/ 으로 이동하도록 dist/index.html 덮어쓰기
      writeFileSync(indexPath, redirect);

      // 옛 게임 주소(/pokemon) → /game/ 리다이렉트
      mkdirSync(join(dist, 'pokemon'), { recursive: true });
      writeFileSync(join(dist, 'pokemon', 'index.html'), redirect);
    },
  };
}

// Vite 설정. 완전 정적 배포.
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
