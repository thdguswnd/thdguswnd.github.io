// 메인 이미지에서 key color 를 추출해 청첩장 테마(배경/글씨/포인트) 팔레트를 만든다.

export interface Palette {
  bg: string;
  text: string;
  accent: string;
  muted: string;
}

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
const mix = (a: number, b: number, t: number) => clamp(a + (b - a) * t);
const toHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map((x) => clamp(x).toString(16).padStart(2, '0')).join('');

/** 평균 RGB(key color)로부터 배경/글씨/포인트/보조 색을 파생한다. */
export function paletteFrom(r: number, g: number, b: number): Palette {
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  // key 가 밝으면 포인트색을 더 어둡게(가독성 확보)
  const accentDark = lum > 150 ? 0.5 : 0.25;
  return {
    // 배경: key 를 흰색과 90% 섞은 아주 옅은 톤
    bg: toHex(mix(r, 255, 0.9), mix(g, 255, 0.9), mix(b, 255, 0.9)),
    // 글씨: key 힌트를 살짝 남긴 짙은 색
    text: toHex(mix(r, 40, 0.85), mix(g, 40, 0.85), mix(b, 40, 0.85)),
    // 포인트: key 를 어둡게
    accent: toHex(mix(r, 0, accentDark), mix(g, 0, accentDark), mix(b, 0, accentDark)),
    // 보조: 중간 톤
    muted: toHex(mix(r, 120, 0.5), mix(g, 120, 0.5), mix(b, 120, 0.5)),
  };
}

/** 이미지 URL에서 평균색을 뽑아 팔레트를 반환. 실패 시 null. */
export function extractPalette(url: string): Promise<Palette | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = 40;
        const h = 40;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const { data } = ctx.getImageData(0, 0, w, h);
        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 125) continue; // 투명 픽셀 제외
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          n += 1;
        }
        if (!n) {
          resolve(null);
          return;
        }
        resolve(paletteFrom(r / n, g / n, b / n));
      } catch {
        resolve(null); // 캔버스 오염 등
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/** 팔레트를 :root CSS 변수에 적용. */
export function applyPalette(p: Palette): void {
  const root = document.documentElement;
  root.style.setProperty('--color-bg', p.bg);
  root.style.setProperty('--color-text', p.text);
  root.style.setProperty('--color-accent', p.accent);
  root.style.setProperty('--color-muted', p.muted);
}
