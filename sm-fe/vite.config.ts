import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// 빌드 후처리 플러그인.
// - 루트(/) = QR 코드 접속용 → /game/ 으로 이동 (게임에서 '건너뛰기'로 청첩장 진입)
// - /invite/ = 카카오톡 등 URL 공유용 → 청첩장
// - OG 미리보기 태그는 루트와 /invite/ 양쪽에 넣는다.
//   리다이렉트 페이지라도 크롤러는 <head> 만 파싱하고 JS/meta refresh 를 따라가지 않으므로
//   루트를 공유해도 미리보기 이미지가 정상 노출된다.
// - 게임은 '/game/' 에 정적 배포됨(public/game).
function emitPages() {
  return {
    name: 'emit-pages',
    closeBundle() {
      const dist = 'dist';
      const indexPath = join(dist, 'index.html');
      if (!existsSync(indexPath)) return;
      const html = readFileSync(indexPath, 'utf-8'); // 기본 청첩장 HTML

      const SITE = 'https://thdguswnd.github.io';
      const THUMB = `${SITE}/thumbnail.jpg`;
      const TITLE = '송현중 · 조나영 결혼합니다';
      const DESC = '2026년 11월 15일 일요일 오전 11시, 로프트가든344';

      /** 카카오톡·SNS 미리보기(OG) 태그. pageUrl 만 페이지별로 다르다. */
      const og = (pageUrl: string) =>
        [
          '<meta property="og:type" content="website" />',
          `<meta property="og:url" content="${pageUrl}" />`,
          `<meta property="og:title" content="${TITLE}" />`,
          `<meta property="og:description" content="${DESC}" />`,
          `<meta property="og:image" content="${THUMB}" />`,
          `<meta property="og:image:secure_url" content="${THUMB}" />`,
          '<meta property="og:image:type" content="image/jpeg" />',
          '<meta property="og:image:width" content="1200" />',
          '<meta property="og:image:height" content="630" />',
          `<meta property="og:site_name" content="${TITLE}" />`,
          '<meta property="og:locale" content="ko_KR" />',
          '<meta name="twitter:card" content="summary_large_image" />',
          `<meta name="twitter:title" content="${TITLE}" />`,
          `<meta name="twitter:description" content="${DESC}" />`,
          `<meta name="twitter:image" content="${THUMB}" />`,
        ].join('\n    ');

      // 기본 청첩장을 /invite/ 에 배치 (+ OG 태그)
      const inviteHtml = html.replace('</head>', `  ${og(`${SITE}/invite/`)}\n  </head>`);
      mkdirSync(join(dist, 'invite'), { recursive: true });
      writeFileSync(join(dist, 'invite', 'index.html'), inviteHtml);

      // 없는 경로로 들어와도 청첩장이 뜨도록 SPA 폴백 (/신랑부 같은 경로 대응)
      writeFileSync(join(dist, '404.html'), inviteHtml);

      /** 이동용 페이지. OG 태그를 포함해 공유 시 미리보기가 뜨게 한다. */
      const redirectTo = (target: string, pageUrl: string) =>
        '<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8">\n    ' +
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n    ' +
        `<title>${TITLE}</title>\n    ` +
        `<meta name="description" content="${DESC}" />\n    ` +
        `${og(pageUrl)}\n    ` +
        `<meta http-equiv="refresh" content="0; url=${target}">\n    ` +
        `<script>location.replace("${target}");</script>\n  </head><body></body></html>`;

      // 옛 게임 주소(/pokemon) → /game/
      mkdirSync(join(dist, 'pokemon'), { recursive: true });
      writeFileSync(join(dist, 'pokemon', 'index.html'), redirectTo('/game/', `${SITE}/pokemon/`));

      // 루트(/) = QR 접속 → 게임으로 이동
      writeFileSync(indexPath, redirectTo('/game/', `${SITE}/`));
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
