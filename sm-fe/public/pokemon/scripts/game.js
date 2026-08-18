/*
 * game.js — 상태 머신 + 렌더 + 입력(터치/클릭) + 전환 연출
 * 흐름: 인트로(오박사) → 신랑/신부 선택 → 확인 → [배틀 전환 연출] → 배틀(4기술) → 승리
 * 조작: 대화창 내부 클릭으로 진행, 선택지/기술은 항목 클릭.
 */
(function () {
  'use strict';

  var DATA = window.GAME_DATA;
  var SPRITES = window.GAME_SPRITES;
  var CHARACTERS = DATA.CHARACTERS;
  var CFG = DATA.CONFIG;

  var state = { scene: 'intro', charKey: null, hits: { song: 0, jo: 0 }, usedMoves: {}, busy: false };

  var el = {};
  function $(id) { return document.getElementById(id); }

  function cacheDom() {
    el.screen = $('screen');
    el.sceneIntro = $('scene-intro');
    el.battle = $('scene-battle');
    el.sceneEnding = $('scene-ending');
    el.coupleLeft = $('couple-left');
    el.coupleRight = $('couple-right');
    el.fxWhite = $('fx-white');
    el.charSlot = $('char-slot');
    el.choiceBox = $('choice-box');
    el.yesnoBox = $('yesno-box');
    el.dialog = $('dialog-box');
    el.dialogText = $('dialog-text');
    el.dialogArrow = $('dialog-arrow');
    el.battleBg = $('battle-bg');
    el.enemyArea = $('enemy-area');
    el.allyArea = $('ally-area');
    el.enemyHpBox = $('enemy-hp-box');
    el.allyHpBox = $('ally-hp-box');
    el.enemyHpName = $('enemy-hp-name');
    el.allyHpName = $('ally-hp-name');
    el.enemyHpGender = $('enemy-hp-gender');
    el.allyHpGender = $('ally-hp-gender');
    el.enemyHpLevel = $('enemy-hp-level');
    el.allyHpLevel = $('ally-hp-level');
    el.enemyHpFill = $('enemy-hp-fill');
    el.allyHpFill = $('ally-hp-fill');
    el.allyHpValue = $('ally-hp-value');
    el.moveMenu = $('move-menu');
    el.cmdBar = $('cmd-bar');
    el.cmdPrompt = $('cmd-prompt');
    el.endMenu = $('end-menu');
    el.fxFlash = $('fx-flash');
    el.fxBlack = $('fx-black');
  }

  // ---- 스프라이트 렌더 (이미지 우선, 실패 시 SVG 폴백) ----
  function renderSprite(container, spec) {
    if (!spec) { container.innerHTML = ''; return; }
    if (!spec.asset) { container.innerHTML = SPRITES[spec.svg] || ''; return; }
    var img = new Image();
    img.className = 'sprite-img';
    img.onload = function () { container.innerHTML = ''; container.appendChild(img); };
    img.onerror = function () { container.innerHTML = SPRITES[spec.svg] || ''; };
    img.src = spec.asset;
  }

  // ---- 타자기 메시지 큐 ----
  var typing = { timer: null, active: false };

  function typeLine(text, done) {
    clearInterval(typing.timer);
    typing.active = true;
    el.dialogArrow.classList.remove('blink');
    var i = 0;
    el.dialogText.textContent = '';
    typing.timer = setInterval(function () {
      el.dialogText.textContent = text.slice(0, ++i);
      if (i >= text.length) {
        clearInterval(typing.timer);
        typing.active = false;
        el.dialogArrow.classList.add('blink');
        if (done) done();
      }
    }, CFG.typeSpeedMs);
  }

  function showMessages(messages, done) {
    var idx = 0;
    state.busy = true;
    if (el.dialog.classList.contains('hidden')) el.dialog.classList.remove('hidden');
    function render() { typeLine(messages[idx], null); }
    render();
    function onTap() {
      if (typing.active) {
        clearInterval(typing.timer); typing.active = false;
        el.dialogText.textContent = messages[idx];
        el.dialogArrow.classList.add('blink');
        return;
      }
      idx++;
      if (idx < messages.length) { render(); }
      else {
        el.dialog.removeEventListener('click', onTap);
        el.dialogArrow.classList.remove('blink');
        state.busy = false;
        if (done) done();
      }
    }
    el.dialog.addEventListener('click', onTap);
  }

  function setScene(name) {
    state.scene = name;
    el.sceneIntro.classList.toggle('hidden', name !== 'intro');
    el.battle.classList.toggle('hidden', name !== 'battle');
    el.sceneEnding.classList.toggle('hidden', name !== 'ending');
  }

  function makeChoice(label, onClick) {
    var item = document.createElement('div');
    item.className = 'choice-item';
    item.textContent = label;
    item.addEventListener('click', onClick);
    return item;
  }

  // ================= 인트로 =================
  function startIntro() {
    setScene('intro');
    el.dialog.classList.remove('battle');
    el.dialog.classList.remove('hidden');
    renderSprite(el.charSlot, DATA.OAK_IMG);
    setTimeout(function () { el.charSlot.classList.add('show'); }, 20);
    showMessages(DATA.INTRO_LINES, afterIntroLines);
  }

  function afterIntroLines() {
    // 오박사 fade out (배경 유지)
    el.charSlot.classList.remove('show');
    setTimeout(askGender, 620);
  }

  function askGender() {
    showMessages([DATA.GENDER_QUESTION], renderGenderChoices);
  }

  function renderGenderChoices() {
    el.charSlot.innerHTML = '';
    el.choiceBox.innerHTML = '';
    DATA.CHOICES.forEach(function (c) {
      el.choiceBox.appendChild(makeChoice(c.label, function () { onChooseGender(c.key); }));
    });
    el.choiceBox.classList.remove('hidden');
  }

  function onChooseGender(key) {
    if (state.busy) return;
    state.charKey = key;
    el.choiceBox.classList.add('hidden');
    var ch = CHARACTERS[key];
    // 선택 캐릭터 front fade in
    renderSprite(el.charSlot, ch.frontImg);
    setTimeout(function () { el.charSlot.classList.add('show'); }, 20);
    showMessages([ch.confirmText], renderYesNo);
  }

  function renderYesNo() {
    el.yesnoBox.innerHTML = '';
    el.yesnoBox.appendChild(makeChoice('네', function () {
      el.yesnoBox.classList.add('hidden');
      var ch = CHARACTERS[state.charKey];
      // '네' 이후 오박사 반응 → 배틀 전환
      showMessages(ch.postConfirm, startBattleTransition);
    }));
    el.yesnoBox.appendChild(makeChoice('아니오', function () {
      el.yesnoBox.classList.add('hidden');
      el.charSlot.classList.remove('show'); // 캐릭터 fade out
      showMessages(['그렇구나! 그럼 다시 물어보마.'], function () {
        setTimeout(function () { state.charKey = null; askGender(); }, 200);
      });
    }));
    el.yesnoBox.classList.remove('hidden');
  }

  // ================= 배틀 전환 연출 =================
  function startBattleTransition() {
    state.busy = true;
    el.dialog.classList.add('hidden');
    el.choiceBox.classList.add('hidden');
    el.yesnoBox.classList.add('hidden');

    // 1) 회색 깜빡임 2회
    el.fxFlash.classList.add('play');
    setTimeout(function () {
      el.fxFlash.classList.remove('play');
      // 2) 바깥→안쪽 블랙아웃
      el.fxBlack.classList.add('closing');
      setTimeout(function () {
        el.fxBlack.classList.remove('closing');
        el.fxBlack.classList.add('full'); // 완전 검정 유지
        // 3) 검은 상태에서 배틀 필드 셋업 + 씬 전환
        setupBattleField();
        setScene('battle');
        // 배틀이 fxBlack(검정) 위에서 가운데 가로선→위아래로 열림.
        // (fxBlack을 계속 켜둬서 클립 바깥이 초록 대신 검정으로 보이게 함)
        el.battle.classList.add('opening');
        // 오픈 완료 후: 검정 제거 + 트레이너 슬라이드 인
        setTimeout(function () {
          el.battle.classList.remove('opening');
          el.fxBlack.classList.remove('full');
          el.fxBlack.style.display = 'none';
          slideInTrainers();
        }, 520);
      }, 470);
    }, 520);
  }

  // 체력: 인물별 피격 횟수로 계산. 송현중은 1/3씩(3대=0), 조나영은 1/6씩(6대=0).
  function maxHits(person) { return person === 'song' ? 3 : 6; }
  function hpPct(person) {
    var m = maxHits(person);
    return Math.max(0, Math.round(100 * (m - state.hits[person]) / m));
  }
  function setHpFill(fillEl, pct) {
    fillEl.style.width = pct + '%';
    fillEl.classList.remove('mid', 'low');
    if (pct <= 25) fillEl.classList.add('low');
    else if (pct <= 50) fillEl.classList.add('mid');
  }

  function setGender(elm, key) {
    if (!elm) return;
    var female = key === 'jo';
    elm.textContent = female ? '♀' : '♂';
    elm.className = 'hp-gender ' + (female ? 'female' : 'male');
  }

  function blinkHit(target) {
    if (!target) return;
    target.classList.remove('hit-blink');
    void target.offsetWidth;
    target.classList.add('hit-blink');
    setTimeout(function () { target.classList.remove('hit-blink'); }, 460);
  }
  function updateBars() {
    var me = CHARACTERS[state.charKey];
    var enemyPct = hpPct(me.opponentKey);
    var allyPct = hpPct(me.key);
    setHpFill(el.enemyHpFill, enemyPct); // 상대(우상)
    setHpFill(el.allyHpFill, allyPct);   // 나(좌하)
    if (el.allyHpValue) {
      var allyHp = Math.max(0, Math.round(20 * allyPct / 100));
      el.allyHpValue.textContent = allyHp + ' / 20';
    }
  }

  function setupBattleField() {
    var ch = CHARACTERS[state.charKey];
    state.usedMoves = {};
    state.hits = { song: 0, jo: 0 };
    el.dialog.classList.add('battle');
    el.battle.classList.remove('is-fighting');
    el.battleBg.classList.remove('settled'); // 전환 중에는 스트릭 흐름
    updateBars();
    el.enemyHpBox.classList.add('hidden-v');
    el.allyHpBox.classList.add('hidden-v');
    el.cmdBar.classList.add('hidden');
    el.enemyArea.style.opacity = '1';
    el.allyArea.style.opacity = '1';

    // 상대(우상)=oppImg, 나(좌하)=backImg
    renderSprite(el.enemyArea, ch.oppImg);
    renderSprite(el.allyArea, ch.backImg);

    // 슬라이드 시작 위치: 상대는 왼쪽 위에서, 나는 오른쪽 아래에서
    el.enemyArea.style.transition = 'none';
    el.allyArea.style.transition = 'none';
    el.enemyArea.style.transform = 'translateX(-320%)';
    el.allyArea.style.transform = 'translateX(320%)';
  }

  function slideInTrainers() {
    void el.enemyArea.offsetWidth; // reflow
    el.enemyArea.style.transition = '';
    el.allyArea.style.transition = '';
    el.enemyArea.style.transform = 'translateX(0)';
    el.allyArea.style.transform = 'translateX(0)';
    setTimeout(afterTrainersIn, 620);
  }

  function afterTrainersIn() {
    var ch = CHARACTERS[state.charKey];
    el.battleBg.classList.add('settled'); // 자리 잡으면 정적 배경(스트릭 제거)
    // 포켓몬 없이 트레이너끼리 직접 진행
    showMessages([ch.battleIntro], function () {
      var opp = CHARACTERS[ch.opponentKey];
      el.enemyHpName.textContent = ch.opponentName;
      el.allyHpName.textContent = ch.name;
      setGender(el.enemyHpGender, ch.opponentKey);
      setGender(el.allyHpGender, ch.key);
      // 레벨은 인물 고정: 송현중 Lv.37 / 조나영 Lv.30 (누구를 선택하든 동일)
      if (el.enemyHpLevel) el.enemyHpLevel.textContent = 'Lv.' + opp.level;
      if (el.allyHpLevel) el.allyHpLevel.textContent = 'Lv.' + ch.level;
      updateBars();
      el.enemyHpBox.classList.remove('hidden-v');
      el.allyHpBox.classList.remove('hidden-v');
      openMoveMenu();
    });
  }

  // ================= 배틀(기술) =================
  function openMoveMenu() {
    el.battle.classList.add('is-fighting');
    el.battle.classList.add('choosing');
    var me = CHARACTERS[state.charKey];
    if (el.cmdPrompt) el.cmdPrompt.textContent = DATA.josa(me.name, '은', '는') + '\n무엇을 물어볼까?';
    el.moveMenu.innerHTML = '';
    DATA.MOVES.forEach(function (mv, i) {
      var item = document.createElement('div');
      item.className = 'move-item';
      var used = !!state.usedMoves[mv.id];
      if (used) item.classList.add('disabled');
      item.textContent = mv.label;
      if (!used) item.addEventListener('click', function () { onUseMove(i); });
      el.moveMenu.appendChild(item);
    });
    el.dialog.classList.add('hidden');       // 내레이션 창 숨기고
    el.cmdBar.classList.remove('hidden');    // 명령 바 표시(좌 프롬프트 + 우 4보기)
  }

  function onUseMove(index) {
    if (state.busy) return;
    var mv = DATA.MOVES[index];
    el.battle.classList.remove('choosing');
    if (mv.flee) { el.cmdBar.classList.add('hidden'); fleeSequence(); return; }
    if (state.usedMoves[mv.id]) return;
    state.usedMoves[mv.id] = true;
    el.cmdBar.classList.add('hidden');
    var me = CHARACTERS[state.charKey];
    var opp = CHARACTERS[me.opponentKey];

    // 내 질문(공격): 좌하 인물이 돌진 → 상대 체력 감소
    el.allyArea.classList.add('lunge');
    setTimeout(function () { el.allyArea.classList.remove('lunge'); }, 400);
    state.hits[opp.key] += 1;
    updateBars();
    blinkHit(el.enemyArea);
    showMessages([mv.ask(me.name)], function () {
      // 상대 대답(반격): 우상 인물이 돌진 → 내 체력 감소
      el.enemyArea.classList.add('lunge');
      setTimeout(function () { el.enemyArea.classList.remove('lunge'); }, 400);
      state.hits[me.key] += 1;
      updateBars();
      blinkHit(el.allyArea);
      showMessages(mv.answer(opp.name), function () {
        // 질문 3개가 끝나 송현중 체력이 0이면 종료 연출
        if (hpPct('song') <= 0) { songDown(); return; }
        openMoveMenu();
      });
    });
  }

  // 송현중 체력 0: 송현중이 "제자리에서" 아래로 가라앉으며 사라짐.
  // 영역 안에서 클립(overflow:hidden) → 화면을 가로지르거나 대화창 밑으로 다시 보이지 않음.
  function songDown() {
    var songArea = (state.charKey === 'song') ? el.allyArea : el.enemyArea;
    songArea.style.overflow = 'hidden';
    var sprite = songArea.firstElementChild; // img 또는 svg
    if (sprite) {
      sprite.style.transition = 'transform .55s ease, opacity .55s ease';
      sprite.style.transform = 'translateY(130%)';
      sprite.style.opacity = '0';
    } else {
      songArea.style.transition = 'opacity .4s ease';
      songArea.style.opacity = '0';
    }
    showMessages(['준비된 질문이 끝났다!'], toEnding);
  }

  // 도망친다: 나(좌하)가 왼쪽 화면 밖으로 "수평 이동"해서 걸어 나감(사라지듯 팟 하고 없어지지 않게)
  function fleeSequence() {
    state.busy = true;
    el.cmdBar.classList.add('hidden');
    el.allyArea.style.transition = 'transform .6s ease-in';
    el.allyArea.style.transform = 'translateX(-320%)'; // 폭의 320% → 화면 왼쪽 밖으로
    showMessages(['질문을 그만두고\n도망쳤다!'], toEnding);
  }

  // 배틀 다음 화면: 흰 화면 → 신랑·신부 나란히 → 멘트 → 재시작/종료 팝업
  function toEnding() {
    el.dialog.classList.add('hidden');
    el.fxWhite.classList.add('show');
    setTimeout(function () {
      setScene('ending');
      el.dialog.classList.remove('battle');
      renderSprite(el.coupleLeft, CHARACTERS.song.frontImg);
      renderSprite(el.coupleRight, CHARACTERS.jo.frontImg);
      el.coupleLeft.style.transition = 'none';
      el.coupleRight.style.transition = 'none';
      el.coupleLeft.style.transform = 'translateX(-200%)';
      el.coupleRight.style.transform = 'translateX(200%)';
      setTimeout(function () {
        el.fxWhite.classList.remove('show');
        void el.coupleLeft.offsetWidth;
        el.coupleLeft.style.transition = 'transform .8s ease';
        el.coupleRight.style.transition = 'transform .8s ease';
        el.coupleLeft.style.transform = 'translateX(0)';
        el.coupleRight.style.transform = 'translateX(0)';
        setTimeout(function () {
          showMessages(DATA.ENDING_LINES, showEndMenu);
        }, 900);
      }, 80);
    }, 520);
  }

  // 엔딩 팝업(다시 시작 / 끝내기) — 대화창 오른쪽 위에 가로로
  function showEndMenu() {
    el.endMenu.innerHTML = '';
    el.endMenu.appendChild(makeChoice('다시 시작', function () {
      location.reload(); // 처음부터 재시작
    }));
    el.endMenu.appendChild(makeChoice('끝내기', function () {
      // 창(브라우저 탭) 종료. 새 창으로 열린 경우 닫힘, 실패 시 청첩장으로.
      window.open('', '_self');
      window.close();
      setTimeout(function () { location.href = CFG.invitationUrl; }, 300);
    }));
    el.endMenu.classList.remove('hidden');
  }

  // ---- 배경 스트릭 생성 ----
  function makeStreaks() {
    if (!el.battleBg) return;
    var confs = [
      { top: 12, w: 22, dur: 1.6, delay: 0 },
      { top: 24, w: 32, dur: 2.1, delay: 0.5 },
      { top: 36, w: 18, dur: 1.4, delay: 0.9 },
      { top: 50, w: 28, dur: 1.9, delay: 0.2 },
      { top: 61, w: 20, dur: 1.5, delay: 1.1 },
      { top: 71, w: 34, dur: 2.3, delay: 0.6 },
      { top: 82, w: 24, dur: 1.7, delay: 0.35 },
    ];
    confs.forEach(function (c) {
      var s = document.createElement('span');
      s.className = 'streak';
      s.style.top = c.top + '%';
      s.style.width = c.w + '%';
      s.style.animationDuration = c.dur + 's';
      s.style.animationDelay = c.delay + 's';
      el.battleBg.appendChild(s);
    });
  }

  // ---- 반응형 레이아웃 (항상 가로, 세로면 90° 회전) ----
  function layout() {
    var screen = el.screen;
    if (!screen) return;
    var vv = window.visualViewport;
    var vw = Math.round(vv ? vv.width : window.innerWidth);
    var vh = Math.round(vv ? vv.height : window.innerHeight);
    if (!vw || !vh) { setTimeout(layout, 60); return; }
    var ASPECT = 3 / 2;
    var portrait = vh > vw;
    var availW = portrait ? vh : vw;
    var availH = portrait ? vw : vh;
    var w = availW, h = w / ASPECT;
    if (h > availH) { h = availH; w = h * ASPECT; }
    screen.style.width = w + 'px';
    screen.style.height = h + 'px';
    screen.style.fontSize = Math.max(11, Math.min(h * 0.05, 30)) + 'px';
    screen.style.transform = 'translate(-50%, -50%) rotate(' + (portrait ? 90 : 0) + 'deg)';
  }

  function bindLayout() {
    window.addEventListener('resize', layout);
    window.addEventListener('orientationchange', function () { setTimeout(layout, 60); });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', layout);
      window.visualViewport.addEventListener('scroll', layout);
    }
    window.addEventListener('load', layout);
    if (window.requestAnimationFrame) requestAnimationFrame(layout);
  }

  function boot() {
    cacheDom();
    bindLayout();
    layout();
    makeStreaks();
    startIntro();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
