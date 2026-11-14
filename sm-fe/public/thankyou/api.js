// 저장소와 통신하는 부분. 화면 코드(app.js)는 아래 네 함수만 씁니다.
//   list()                      → { open, items: [{ id, kind: 'image'|'video', thumbUrl, createdAt }] }
//   start(meta)                 → 업로드 계획 { id, original: {...}, thumbUrl? }
//   put(url, blob, onProgress)  → { etag }
//   finish(id, body)            → 업로드 완료 등록
//   hide(id)                    → 숨기기
//
// ── 실제 서버(Lambda)와 맞출 계약 ───────────────────────────
// GET  {apiBase}/items
//      → { open: true, items: [{ id, kind, thumb: 'abc.jpg', createdAt }] }   (숨긴 항목 제외)
// POST {apiBase}/upload/start   { name, type, size, hasThumb, phone? }   phone: 숫자 11자리(010...) 또는 생략
//      저장 이름: original/001_12345678.jpg (번호 없으면 기기별 001_nonumb000.jpg)
//      → { id,
//          original: { type: 'single', url }                                  (작은 파일)
//                  | { type: 'multipart', uploadId, partSize, partUrls: [url, ...] },  (큰 파일)
//          thumbUrl? }                                                       (hasThumb일 때)
//      → 409 { code: 'CLOSED' }  업로드 기간 아님 / 429 { code: 'LIMIT' } 개수 초과
// POST {apiBase}/upload/finish  { id, uploadId?, parts?: [{ PartNumber, ETag }] }
// POST {apiBase}/items/{id}/hide
// POST {apiBase}/items/{id}/like  { on: true|false }  → { likes }
//      서버는 (항목 ID, 기기 ID) 쌍을 한 번만 저장합니다. 이미 누른 기기가 다시 on을 보내면 숫자를 올리지 않습니다.
//      목록(items)의 각 항목에는 likes(숫자)가 들어 있습니다.
// 요청 헤더 X-Device-Id: 기기를 구분하는 무작위 값 (업로드 개수 제한, 좋아요 중복 방지)
(function () {
  'use strict';
  const C = window.APP_CONFIG;

  const deviceId = (() => {
    try {
      let v = localStorage.getItem('deviceId');
      if (!v) { v = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('deviceId', v); }
      return v;
    } catch (e) { return 'anon-' + Math.random().toString(36).slice(2); }
  })();

  function apiError(status, body) {
    const e = new Error((body && body.message) || ('HTTP ' + status));
    e.status = status; e.code = body && body.code;
    return e;
  }

  // XHR로 PUT (업로드 진행률을 받기 위해 fetch 대신 사용)
  function xhrPut(url, blob, onProgress) {
    return new Promise((resolve, reject) => {
      const x = new XMLHttpRequest();
      x.open('PUT', url);
      if (blob.type) x.setRequestHeader('Content-Type', blob.type);
      x.upload.onprogress = e => { if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total); };
      x.onload = () => (x.status >= 200 && x.status < 300)
        ? resolve({ etag: x.getResponseHeader('ETag') })   // S3 CORS에 ExposeHeaders: ETag 필요
        : reject(apiError(x.status));
      x.onerror = () => reject(apiError(0, { message: 'network' }));
      x.send(blob);
    });
  }

  // ── 실제 AWS ──────────────────────────────────────────
  const AwsApi = {
    async req(method, path, body) {
      const r = await fetch(C.apiBase + path, {
        method,
        headers: Object.assign({ 'X-Device-Id': deviceId }, body ? { 'Content-Type': 'application/json' } : {}),
        body: body ? JSON.stringify(body) : undefined,
        });
      let j = null; try { j = await r.json(); } catch (e) { /* 빈 응답 */ }
      if (!r.ok) throw apiError(r.status, j);
      return j;
    },
    async list() {
      const j = await this.req('GET', '/items');
      return { open: j.open, items: (j.items || []).map(i => Object.assign({}, i, { thumbUrl: i.thumb ? C.thumbBase + i.thumb : '' })) };
    },
    start(meta) { return this.req('POST', '/upload/start', meta); },
    put: xhrPut,
    finish(id, body) { return this.req('POST', '/upload/finish', Object.assign({ id }, body || {})); },
    hide(id) { return this.req('POST', '/items/' + encodeURIComponent(id) + '/hide'); },
    like(id, on) { return this.req('POST', '/items/' + encodeURIComponent(id) + '/like', { on }); },
  };

  // ── 가짜 모드 (로컬 테스트) ─────────────────────────────
  function sampleScene(i) {
    const h = (i * 47) % 360;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 100">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="hsl(${h},55%,72%)"/><stop offset="1" stop-color="hsl(${(h + 40) % 360},50%,88%)"/></linearGradient></defs>
      <rect width="80" height="100" fill="url(#g)"/>
      <circle cx="${20 + (i * 13) % 40}" cy="26" r="9" fill="hsl(${(h + 180) % 360},70%,92%)"/>
      <path d="M0 70 L22 48 L40 64 L58 42 L80 66 L80 100 L0 100Z" fill="hsl(${(h + 200) % 360},30%,42%)"/>
      <path d="M0 82 L30 66 L52 80 L80 72 L80 100 L0 100Z" fill="hsl(${(h + 200) % 360},28%,30%)"/></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  const mockItems = [];
  // 가짜 모드(로컬 시험)는 올라온 사진 없이 시작합니다. 실제 모드와 같은 첫 화면이 됩니다

  const mockLikes = {};   // 항목 ID → 좋아요를 누른 기기 ID 집합 (서버의 중복 방지 표를 흉내)
  const pending = {};
  const wait = ms => new Promise(r => setTimeout(r, ms));

  const MockApi = {
    async list() { await wait(150); return { open: true, items: mockItems.map(i => Object.assign({}, i)) }; },
    async like(id, on) {
      await wait(150);
      const it = mockItems.find(x => x.id === id);
      if (!it) throw apiError(404);
      const set = mockLikes[id] || (mockLikes[id] = new Set());
      if (on && !set.has(deviceId)) { set.add(deviceId); it.likes++; }
      if (!on && set.has(deviceId)) { set.delete(deviceId); it.likes = Math.max(0, it.likes - 1); }
      return { likes: it.likes };
    },
    async start(meta) {
      await wait(200);
      const id = 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const big = meta.size > 20 * 1024 * 1024;
      pending[id] = { kind: meta.type.startsWith('video') ? 'video' : 'image' };
      return {
        id,
        original: big
          ? { type: 'multipart', uploadId: 'mock', partSize: 10 * 1024 * 1024, partUrls: Array.from({ length: Math.ceil(meta.size / (10 * 1024 * 1024)) }, (_, n) => 'mock://' + id + '/part' + (n + 1)) }
          : { type: 'single', url: 'mock://' + id + '/original' },
        thumbUrl: meta.hasThumb ? 'mock://' + id + '/thumb' : undefined,
      };
    },
    async put(url, blob, onProgress) {
      // 실제 전송 대신 진행률만 흉내 냅니다 (최대 약 2초)
      const total = Math.min(2000, 300 + blob.size / (40 * 1024));
      for (let t = 0; t <= total; t += 100) { await wait(100); if (onProgress) onProgress(Math.min(1, t / total)); }
      const m = /^mock:\/\/([^/]+)\/thumb$/.exec(url);
      if (m) pending[m[1]].thumbUrl = URL.createObjectURL(blob);
      return { etag: '"mock"' };
    },
    async finish(id) {
      await wait(150);
      const p = pending[id];
      mockItems.unshift({ id, kind: p.kind, thumbUrl: p.thumbUrl || '', createdAt: Date.now(), likes: 0 });
      delete pending[id];
      return { ok: true };
    },
    async hide(id) {
      await wait(150);
      const i = mockItems.findIndex(x => x.id === id);
      if (i >= 0) mockItems.splice(i, 1);
      return { ok: true };
    },
  };

  window.API = C.mode === 'aws' ? AwsApi : MockApi;
  window.API.sampleScene = sampleScene;
})();
