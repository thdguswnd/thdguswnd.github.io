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
      // OG 미리보기 이미지.
      //  - 기본값은 JPEG: 카카오톡 등 일부 크롤러·구형 웹뷰가 webp 를 렌더하지 못한다.
      //    1200x630(1.91:1) 가로형이라 큰 배너로 안정적으로 노출된다.
      //    생성: yarn og:fallback (scripts/make-og-fallback.mjs)
      //  - webp(1600x2400, src/assets/start.webp 사본)는 보조로만 덧붙인다.
      //    webp 를 지원하는 크롤러는 이걸 고를 수 있다.
      const THUMB_JPG = `${SITE}/thumbnail.jpg`;
      const THUMB_JPG_W = '1200';
      const THUMB_JPG_H = '630';
      const THUMB_WEBP = `${SITE}/thumbnail.webp`;
      const THUMB_WEBP_W = '1600';
      const THUMB_WEBP_H = '2400';
      const TITLE = '송현중 · 조나영 결혼합니다';
      const DESC = '2026년 11월 15일 일요일 오전 11시, 로프트가든344';

      /** 카카오톡·SNS 미리보기(OG) 태그. pageUrl 만 페이지별로 다르다. */
      const og = (pageUrl: string) =>
        [
          '<meta property="og:type" content="website" />',
          `<meta property="og:url" content="${pageUrl}" />`,
          `<meta property="og:title" content="${TITLE}" />`,
          `<meta property="og:description" content="${DESC}" />`,
          // 1순위: JPEG (크롤러는 보통 첫 og:image 를 쓴다)
          `<meta property="og:image" content="${THUMB_JPG}" />`,
          `<meta property="og:image:secure_url" content="${THUMB_JPG}" />`,
          '<meta property="og:image:type" content="image/jpeg" />',
          `<meta property="og:image:width" content="${THUMB_JPG_W}" />`,
          `<meta property="og:image:height" content="${THUMB_JPG_H}" />`,
          `<meta property="og:image:alt" content="${TITLE}" />`,
          // 2순위: WebP (지원하는 크롤러용 보조)
          `<meta property="og:image" content="${THUMB_WEBP}" />`,
          '<meta property="og:image:type" content="image/webp" />',
          `<meta property="og:image:width" content="${THUMB_WEBP_W}" />`,
          `<meta property="og:image:height" content="${THUMB_WEBP_H}" />`,
          `<meta property="og:site_name" content="${TITLE}" />`,
          '<meta property="og:locale" content="ko_KR" />',
          '<meta name="twitter:card" content="summary_large_image" />',
          `<meta name="twitter:title" content="${TITLE}" />`,
          `<meta name="twitter:description" content="${DESC}" />`,
          `<meta name="twitter:image" content="${THUMB_JPG}" />`,
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
