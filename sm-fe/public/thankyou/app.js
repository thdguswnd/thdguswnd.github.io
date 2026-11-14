(function () {
  'use strict';
  const C = window.APP_CONFIG;
  const API = window.API;
  const $ = s => document.querySelector(s);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = s => String(s).replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
  const fmtSize = b => b >= 1073741824 ? (b / 1073741824).toFixed(1) + 'GB' : b >= 1048576 ? (b / 1048576).toFixed(1) + 'MB' : Math.max(1, Math.round(b / 1024)) + 'KB';

  // ── 기본 문구, 캐릭터 ───────────────────────────────────
  $('#title').textContent = C.title;
  $('#subtitle').textContent = C.subtitle;
  if (C.character && C.character.src) {
    $('#character').innerHTML = '';
    const img = new Image(); img.src = C.character.src; img.alt = '';
    $('#character').appendChild(img);
  }
  // 가운데 길 배경: 필름과 같은 속도로 위로 흘러 캐릭터가 아래로 걷는 것처럼 보이게 합니다
  const road = { el: document.getElementById('road'), tileH: 0, offset: 0 };
  if (C.road && C.road.src && road.el) {
    const rimg = new Image();
    rimg.onload = () => {
      road.el.style.backgroundImage = 'url("' + C.road.src + '")';
      const fit = () => { road.tileH = road.el.clientWidth * rimg.naturalHeight / rimg.naturalWidth; };
      fit(); window.addEventListener('resize', fit);
    };
    rimg.src = C.road.src;
  }
  // ── 토스트 ─────────────────────────────────────────────
  let toastTimer;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2400);
  }

  // ── 오버레이 공통 ───────────────────────────────────────
  let paused = false;
  function openOverlay(o) { o.hidden = false; paused = o.id !== 'infoOverlay'; }
  function closeOverlay(o) { o.hidden = true; paused = false; }
  document.querySelectorAll('.overlay').forEach(o => {
    o.addEventListener('click', e => {
      if (e.target === o || e.target.closest('[data-close]')) {
        if (o.id === 'uploadOverlay' && uploading) { toast('업로드가 끝난 뒤 닫을 수 있습니다'); return; }
        closeOverlay(o);
      }
    });
  });

  // ── 정보 메뉴 ──────────────────────────────────────────
  C.menus.forEach(m => {
    const b = el('button'); b.type = 'button'; b.textContent = m.label;
    b.addEventListener('click', () => {
      $('#infoTitle').textContent = m.title || m.label;
      const body = $('#infoBody'); body.innerHTML = '';
      String(m.text || '').split('\n').forEach(line => body.appendChild(el('p', null, esc(line))));
      (m.images || []).forEach(src => { const i = new Image(); i.src = src; i.alt = ''; body.appendChild(i); });
      openOverlay($('#infoOverlay'));
    });
    (m.position === 'bottom' ? $('#menuBottom') : $('#menuTop')).appendChild(b);
  });

  // ── 필름 ───────────────────────────────────────────────
  // 양쪽 모두 같은 '초당 px'로 움직입니다. 목록이 바뀌어도 지금 보이는 위치(px)를 유지합니다.
  function Film(root) {
    this.root = root;
    this.track = el('div', 'film-track');
    root.appendChild(this.track);
    this.offset = 0; this.half = 0; this.key = ''; this.items = []; this.seqLen = 0;
  }
  Film.prototype.frame = function (it) {
    const f = el('div', 'frame' + (it.sample ? ' sample' : ''));
    f.dataset.id = it.id;
    const img = new Image(); img.decoding = 'async'; img.alt = ''; img.src = it.thumbUrl;
    img.onerror = () => { img.src = API.sampleScene(3); };
    f.appendChild(img);
    if (it.likes > 0) f.appendChild(el('span', 'likes', '♥ ' + it.likes));
    return f; 
  }; 
  // 화면 바로 아래(곧 올라올 자리)에 해당하는 목록 위치. 새 사진을 여기에 넣으면 바로 보입니다. 
  Film.prototype.nextIndex = function () { 
    if (!this.half || !this.items.length) return 0; 
    const frameH = this.half / this.seqLen; 
    const idx = Math.ceil((this.offset + this.root.clientHeight) / frameH) % this.seqLen; 
    return idx % this.items.length; 
  }; 
  // 목록이 그대로여도 좋아요 수는 바뀔 수 있으니, 필름을 다시 그리지 않고 숫자만 갱신 
  Film.prototype.updateLikes = function (byId) { 
    this.track.querySelectorAll('.frame').forEach(f => { 
      const n = byId[f.dataset.id] || 0; 
      let b = f.querySelector('.likes'); 
      if (n > 0) { if (!b) { b = el('span', 'likes'); f.appendChild(b); } b.textContent = '♥ ' + n; } 
      else if (b) b.remove(); 
    }); 
  }; 
  Film.prototype.set = function (items, force) { 
    const key = items.map(i => i.id).join(','); 
    if (key === this.key && !force) return; 
    this.key = key; this.items = items; 
    const keep = this.offset; 
    // 화면 높이를 채울 만큼 반복 
    const w = this.root.clientWidth * 0.72; 
    const frameH = w * 1.25 + 10; 
    const need = Math.max(items.length, Math.ceil(this.root.clientHeight / frameH) + 1); 
    const seq = []; 
    for (let i = 0; seq.length < need; i++) seq.push(items[i % items.length]); 
    const group = () => { const g = el('div', 'film-group'); seq.forEach(it => g.appendChild(this.frame(it))); return g; }; 
    this.track.innerHTML = ''; 
    this.track.append(group(), group()); 
    this.seqLen = seq.length; 
    this.half = this.track.firstChild.offsetHeight; 
    this.offset = this.half ? keep % this.half : 0; 
  }; 
  Film.prototype.step = function (dt, speed) { 
    if (!this.half) return; 
    this.offset = (this.offset + speed * dt) % this.half; 
    this.track.style.transform = 'translate3d(0,' + (-this.offset).toFixed(2) + 'px,0)'; 
  }; 

  const films = [new Film($('#filmLeft')), new Film($('#filmRight'))]; 
  let allItems = []; 
  const likeOverride = {}; 
  const hiddenLocal = new Set(JSON.parse(localStorage.getItem('hiddenLocal') || '[]')); 

  // 필름에 올릴 사진 고르기 
  //  - 동영상과 썸네일이 없는 항목은 필름에 띄우지 않습니다 
  //  - 사진이 많으면 한쪽에 최대 maxPerSide장만 무작위로 골라 띄우고, rotateSeconds마다 일부를 다른 사진으로 바꿉니다 
  //  - 새로 올라온 사진은 화면 바로 아래 칸에 끼워 넣어 곧바로 올라오게 합니다 
  const sides = [[], []]; 
  let picked = false; 
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }; 
  const farIndex = (f, len) => (f.nextIndex() + Math.floor(len / 2)) % len;   // 지금 화면에서 가장 먼 칸 

  function photos() { return allItems.filter(i => i.kind !== 'video' && i.thumbUrl && !hiddenLocal.has(i.id)); } 

  function syncSides() { 
    const list = photos(); 
    const byId = new Map(list.map(i => [i.id, i])); 
    const max = C.film.maxPerSide; 
    // 숨김이나 삭제된 사진 빼고, 최신 좋아요 수로 바꿔 끼우기
for (let s = 0; s < 2; s++) sides[s] = sides[s].filter(i => byId.has(i.id)).map(i => byId.get(i.id)); 
    const shown = new Set(sides[0].concat(sides[1]).map(i => i.id)); 

    if (!picked) { 
      if (!list.length) return; 
      picked = true; 
      // 처음: 최근 사진 10장 + 나머지에서 무작위로 채운 뒤 섞어서 양쪽에 나눔 
      const byNew = list.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)); 
      const chosen = shuffle(byNew.slice(0, 10).concat(shuffle(byNew.slice(10)).slice(0, max * 2 - 10))); 
      chosen.forEach((it, i) => sides[i % 2].push(it)); 
      return; 
    } 
    // 새로 올라온 사진: 짧은 쪽의 화면 바로 아래 칸에 넣기 
    list.filter(i => !shown.has(i.id)) 
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)) 
      .forEach(it => { 
        const s = sides[0].length === sides[1].length ? (Math.random() < 0.5 ? 0 : 1) : (sides[0].length < sides[1].length ? 0 : 1); 
        sides[s].splice(films[s].nextIndex(), 0, it); 
        if (sides[s].length > max) sides[s].splice(farIndex(films[s], sides[s].length), 1); 
      }); 
  } 

  // 사진이 많을 때 화면 밖 칸 몇 개를 아직 안 나온 사진으로 교체 
  function rotate() { 
    const shown = new Set(sides[0].concat(sides[1]).map(i => i.id)); 
    const pool = shuffle(photos().filter(i => !shown.has(i.id))); 
    for (let k = 0; k < 6 && pool.length; k++) { 
      const s = k % 2; 
      if (!sides[s].length) continue; 
      sides[s][farIndex(films[s], sides[s].length)] = pool.pop(); 
    } 
    render(); 
  } 

  function render(force) { 
    syncSides(); 
    for (let s = 0; s < 2; s++) { 
      const filled = sides[s].slice(); 
      for (let i = 0; filled.length < C.film.minPerSide; i++) filled.push({ id: 'sample' + s + '-' + i, thumbUrl: API.sampleScene(i * 2 + s + 20), sample: true }); 
      films[s].set(filled, force); 
    } 
    const byId = {}; allItems.forEach(i => { byId[i.id] = i.likes || 0; }); 
    films.forEach(f => f.updateLikes(byId)); 
  } 

  async function refresh() { 
    try { 
      const r = await API.list(); 
      // 목록은 캐시되어 최대 20초 늦을 수 있으므로, 방금 누른 좋아요 수는 잠시 내 값을 우선합니다 
      const now = Date.now(); 
      r.items.forEach(i => { const o = likeOverride[i.id]; if (o && o.until > now) i.likes = o.likes; }); 
      allItems = r.items; 
      setOpenState(r.open); 
      render(); 
    } catch (e) { /* 다음 주기에 다시 시도 */ } 
  } 

  const speed = C.film.speed * (matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.4 : 1); 
  let last = performance.now(); 
  function tick(t) { 
    const dt = Math.min(0.05, (t - last) / 1000); last = t; 
    if (!paused && !document.hidden) {
      films.forEach(f => f.step(dt, speed));
      if (road.tileH) {
        road.offset = (road.offset + speed * dt) % road.tileH;
        road.el.style.backgroundPositionY = (-road.offset).toFixed(2) + 'px';
      }
    }
    requestAnimationFrame(tick); 
  } 
  requestAnimationFrame(tick); 
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => render(true), 200); });
// ── 업로드 기간 안내 ───────────────────────────────────
  function setOpenState(open) {
    const now = Date.now();
    const s = Date.parse(C.uploadWindow.start), e = Date.parse(C.uploadWindow.end);
    const btn = $('#btnUpload');
    const closed = open === false;
    btn.disabled = closed;
    const md = d => (d.getMonth() + 1) + '/' + d.getDate();
    if (closed && now < s) $('#windowHint').textContent = md(new Date(s)) + '부터 올릴 수 있습니다';
    else if (closed) $('#windowHint').textContent = '업로드 기간이 끝났습니다';
    else $('#windowHint').textContent = md(new Date(e)) + '까지 올릴 수 있습니다';
  }

  // ── 확대 보기 + 숨기기 ─────────────────────────────────
  let viewing = null;
  function onFrameTap(e) {
    const f = e.target.closest('.frame'); if (!f) return;
    const it = allItems.find(i => i.id === f.dataset.id);
    if (!it) { toast('예시 이미지입니다. 사진을 올리면 여기에 표시됩니다'); return; }
    viewing = it;
    const stage = $('#viewStage'); stage.innerHTML = '';
    const img = new Image(); img.src = it.thumbUrl; img.alt = '';
    stage.appendChild(img);
    drawLike(it);
    $('#viewActions').hidden = false; $('#viewConfirm').hidden = true;
    openOverlay($('#viewOverlay'));
  }

  // ── 좋아요 ─────────────────────────────────────────────
  // 이 기기에서 누른 항목은 기기에 기억하고, 중복 여부는 서버가 기기 ID로 최종 판정합니다.
  const likedLocal = new Set(JSON.parse(localStorage.getItem('likedLocal') || '[]'));
  const saveLiked = () => { try { localStorage.setItem('likedLocal', JSON.stringify([...likedLocal])); } catch (e) { /* 무시 */ } };
  function drawLike(it) {
    const on = likedLocal.has(it.id);
    const b = $('#btnLike');
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', String(on));
    b.querySelector('.heart').textContent = on ? '♥' : '♡';
    $('#likeCount').textContent = it.likes > 0 ? it.likes : '';
  }
  let liking = false;
  $('#btnLike').addEventListener('click', async () => {
    const it = viewing; if (!it || liking) return;
    liking = true;
    const on = !likedLocal.has(it.id);
    const before = it.likes || 0;
    // 먼저 화면에 반영하고, 서버 결과로 숫자를 맞춥니다
    on ? likedLocal.add(it.id) : likedLocal.delete(it.id);
    it.likes = Math.max(0, before + (on ? 1 : -1));
    drawLike(it); render();
    try {
      const r = await API.like(it.id, on);
      if (typeof r.likes === 'number') it.likes = r.likes;
      likeOverride[it.id] = { likes: it.likes, until: Date.now() + (C.pollSeconds + 15) * 1000 };
      saveLiked();
    } catch (e) {
      on ? likedLocal.delete(it.id) : likedLocal.add(it.id);
      it.likes = before;
      toast('좋아요를 반영하지 못했습니다. 잠시 뒤 다시 눌러 주세요');
    }
    drawLike(it); render();
    liking = false;
  });
  films.forEach(f => f.root.addEventListener('click', onFrameTap));
  $('#btnHide').addEventListener('click', () => { $('#viewActions').hidden = true; $('#viewConfirm').hidden = false; });
  $('#btnHideNo').addEventListener('click', () => { $('#viewActions').hidden = false; $('#viewConfirm').hidden = true; });
$('#btnHideYes').addEventListener('click', async () => {
    const it = viewing; if (!it) return;
    hiddenLocal.add(it.id);                       // 서버 응답과 상관없이 내 화면에서는 바로 숨김
    try { localStorage.setItem('hiddenLocal', JSON.stringify([...hiddenLocal])); } catch (e) { /* 무시 */ }
    closeOverlay($('#viewOverlay'));
    render();
    try { await API.hide(it.id); toast('숨겼습니다'); }
    catch (e) { toast('내 화면에서는 숨겼습니다. 다른 사람 화면 반영은 잠시 뒤 다시 시도됩니다'); retryHide(it.id); }
  });
  function retryHide(id, n = 0) { if (n > 4) return; setTimeout(() => API.hide(id).catch(() => retryHide(id, n + 1)), 3000 * (n + 1)); }

  // ── 업로드 ─────────────────────────────────────────────
  const entries = [];
  let uploading = false;
  const input = $('#fileInput');
  // 전화번호 (선택): 입력하는 대로 010-1234-5678 형태로 맞추고, 이 기기에 기억해 둡니다
  const phoneEl = $('#phoneInput');
  const fmtPhone = d => d.length < 4 ? d : d.length < 8 ? d.slice(0, 3) + '-' + d.slice(3) : d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7, 11);
  function showPhoneNotice(msg, err) {
    const n = $('#phoneNotice');
    n.textContent = msg || C.phoneNotice || '';
    n.classList.toggle('err', !!err);
    phoneEl.classList.toggle('invalid', !!err);
  }
  // 비어 있으면 '', 올바르면 숫자 11자리, 틀리면 null
  function readPhone() {
    const d = phoneEl.value.replace(/\D/g, '');
    if (!d) return '';
    return /^010\d{8}$/.test(d) ? d : null;
  }
  phoneEl.addEventListener('input', () => {
    const d = phoneEl.value.replace(/\D/g, '').slice(0, 11);
    phoneEl.value = fmtPhone(d);
    if (phoneEl.classList.contains('invalid') && readPhone() !== null) showPhoneNotice();
  });
  try { const saved = localStorage.getItem('phone'); if (saved) phoneEl.value = fmtPhone(saved); } catch (e) { /* 무시 */ }
  showPhoneNotice();

  $('#btnUpload').addEventListener('click', () => { openOverlay($('#uploadOverlay')); updateUploadUI(); });
  $('#btnPick').addEventListener('click', () => input.click());
  input.addEventListener('change', () => {
    [...input.files].forEach(file => {
      const kind = file.type.startsWith('video') ? 'video' : file.type.startsWith('image') || /\.(heic|heif)$/i.test(file.name) ? 'image' : null;
      if (!kind) return;
      const en = { file, kind, status: 'ready', progress: 0, row: null, preview: kind === 'image' ? URL.createObjectURL(file) : '' };
      entries.push(en); drawRow(en);
    });
    input.value = '';
    updateUploadUI();
  });

  function drawRow(en) {
    const li = en.row || el('li', 'up-item');
    li.className = 'up-item ' + en.status;
    const label = { ready: '대기', uploading: '올리는 중 ' + Math.round(en.progress * 100) + '%', done: '완료', error: en.error || '실패' }[en.status];
    li.innerHTML =
      '<div class="up-thumb">' + (en.preview ? '<img src="' + en.preview + '" alt="">' : '▶') + '</div>' +
      '<div class="up-meta"><div class="up-name">' + esc(en.file.name) + '</div>' +
      '<div class="up-sub">' + fmtSize(en.file.size) + ' · ' + label + '</div>' +
      '<div class="up-bar"><i style="width:' + Math.round(en.progress * 100) + '%"></i></div></div>' +
      '<div class="up-act">' + (en.status === 'ready' ? '<button data-act="remove" type="button">빼기</button>' : en.status === 'error' ? '<button class="retry" data-act="retry" type="button">다시</button>' : '') + '</div>';
    if (!en.row) {
      en.row = li; $('#upList').appendChild(li);
      li.addEventListener('click', e => {
        const act = e.target.dataset.act;
        if (act === 'remove') { entries.splice(entries.indexOf(en), 1); li.remove(); updateUploadUI(); }
        if (act === 'retry') { en.status = 'ready'; en.progress = 0; drawRow(en); startUpload(); }
      });
    }
  }

  function updateUploadUI() {
    const ready = entries.filter(e => e.status === 'ready').length;
    const done = entries.filter(e => e.status === 'done').length;
    const err = entries.filter(e => e.status === 'error').length;
    const btn = $('#btnStart');
    btn.disabled = uploading || ready === 0;
btn.textContent = uploading ? '올리는 중…' : ready ? ready + '개 올리기' : '올리기';
    $('#btnPick').disabled = uploading;
    $('#phoneInput').disabled = uploading;
    const parts = [];
    if (done) parts.push(done + '개 완료');
    if (err) parts.push(err + '개 실패');
    $('#upSummary').textContent = parts.join(' · ');
  }

  // 사진 썸네일: 긴 변 720px JPEG (필름과 확대 보기에 함께 사용). 위치정보 같은 메타데이터는 다시 그리면서 빠집니다.
  async function makeThumb(file) {
    try {
      let src;
      if (window.createImageBitmap) {
        try { src = await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch (e) { src = null; }
      }
      if (!src) {
        src = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); });
      }
      const w0 = src.width || src.naturalWidth, h0 = src.height || src.naturalHeight;
      const s = Math.min(1, 720 / Math.max(w0, h0));
      const cv = document.createElement('canvas');
      cv.width = Math.round(w0 * s); cv.height = Math.round(h0 * s);
      cv.getContext('2d').drawImage(src, 0, 0, cv.width, cv.height);
      // toBlob이 응답하지 않는 브라우저가 있어 5초 뒤에는 toDataURL(동기 방식)로 대신 만듭니다
      const viaBlob = new Promise(res => { try { cv.toBlob(b => res(b), 'image/jpeg', 0.75); } catch (e) { res(null); } });
      const timeout = new Promise(res => setTimeout(() => res(null), 5000));
      let blob = await Promise.race([viaBlob, timeout]);
      if (!blob) {
        const url = cv.toDataURL('image/jpeg', 0.75);
        const bin = atob(url.split(',')[1]);
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        blob = new Blob([arr], { type: 'image/jpeg' });
      }
      return blob;
    } catch (e) { return null; }   // 브라우저가 못 읽는 형식이면 썸네일 없이 원본만 올립니다
  }

  async function putWithRetry(url, blob, onProgress) {
    for (let n = 0; ; n++) {
      try { return await API.put(url, blob, onProgress); }
      catch (e) { if (n >= 3) throw e; await new Promise(r => setTimeout(r, 1000 * (n + 1))); }
    }
  }

  async function uploadOne(en, phone) {
    en.status = 'uploading'; en.progress = 0; drawRow(en);
    const thumb = en.kind === 'image' ? await makeThumb(en.file) : null;
    const plan = await API.start({ name: en.file.name, type: en.file.type || 'application/octet-stream', size: en.file.size, hasThumb: !!thumb, phone: phone || undefined });
    let finishBody = {};
    if (plan.original.type === 'single') {
      await putWithRetry(plan.original.url, en.file, p => { en.progress = p * 0.95; drawRow(en); });
    } else {
      const { partSize, partUrls, uploadId } = plan.original;
      const parts = [];
      for (let i = 0; i < partUrls.length; i++) {
        const blob = en.file.slice(i * partSize, (i + 1) * partSize);
        const r = await putWithRetry(partUrls[i], blob, p => { en.progress = ((i + p) / partUrls.length) * 0.95; drawRow(en); });
        parts.push({ PartNumber: i + 1, ETag: r.etag });
      }
      finishBody = { uploadId, parts };
    }
if (thumb && plan.thumbUrl) await putWithRetry(plan.thumbUrl, thumb);
    await API.finish(plan.id, finishBody);
    en.status = 'done'; en.progress = 1; drawRow(en);
  }

  async function startUpload() {
    if (uploading) return;
    uploading = true; updateUploadUI();
    const queue = entries.filter(e => e.status === 'ready');
    let stop = null;
    const worker = async () => {
      while (queue.length && !stop) {
        const en = queue.shift();
        try { await uploadOne(en); }
        catch (e) {
          en.status = 'error';
          en.error = e.code === 'CLOSED' ? '업로드 기간이 아닙니다' : e.code === 'LIMIT' ? '올릴 수 있는 개수를 넘었습니다' : '실패 (다시 시도해 주세요)';
          if (e.code === 'CLOSED' || e.code === 'LIMIT') stop = e.code;
          drawRow(en);
        }
        updateUploadUI();
      }
    };
    await Promise.all([worker(), worker()]);   // 동시에 2개씩
    queue.forEach(en => { en.status = 'error'; en.error = stop === 'CLOSED' ? '업로드 기간이 아닙니다' : '올릴 수 있는 개수를 넘었습니다'; drawRow(en); });
    uploading = false; updateUploadUI();
    const done = entries.filter(e => e.status === 'done').length;
    if (done) { toast('올렸습니다. 필름에 곧 나타납니다'); refresh(); }
  }
  $('#btnStart').addEventListener('click', startUpload);
  window.addEventListener('beforeunload', e => { if (uploading) { e.preventDefault(); e.returnValue = ''; } });

  // ── 시작 ───────────────────────────────────────────────
  render();
  refresh();
  setInterval(refresh, C.pollSeconds * 1000);
  setInterval(rotate, C.film.rotateSeconds * 1000);
})();
