import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// 빌드 후처리 플러그인.
// - 루트(/) 접속 시 /game/ 로 리다이렉트
// - 기본 청첩장은 /invite/ 에 배치 및 404.html(SPA 폴백)에 복사
// - 게임은 '/game/' 에 정적 배포됨(public/game).
function emitPages() {
  return {
    name: 'emit-pages',
    closeBundle() {
      const dist = 'dist';
      const indexPath = join(dist, 'index.html');
      if (!existsSync(indexPath)) return;
      const html = readFileSync(indexPath, 'utf-8'); // 기본 청첩장 HTML

      // 기본 청첩장을 /invite/ 에 배치
      mkdirSync(join(dist, 'invite'), { recursive: true });
      writeFileSync(join(dist, 'invite', 'index.html'), html);

      const gameRedirect =
        '<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1">' +
        '<meta http-equiv="refresh" content="0; url=/game/">' +
        '<title>이동 중…</title>' +
        '<script>location.replace("/game/");</script></head><body></body></html>';
      const inviteRedirect =
        '<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1">' +
        '<meta http-equiv="refresh" content="0; url=/invite/">' +
        '<title>이동 중…</title>' +
        '<script>location.replace("/invite/");</script></head><body></body></html>';

      // 존재하지 않는 경로는 청첩장 정식 주소로 이동
      writeFileSync(join(dist, '404.html'), inviteRedirect);

      // 루트(/) 접속 시 바로 /game/ 으로 이동하도록 dist/index.html 덮어쓰기
      writeFileSync(indexPath, gameRedirect);

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
