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

  var state = { scene: 'intro', charKey: null, enemyHp: 100, usedMoves: {}, busy: false };

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
    el.enemyHpFill = $('enemy-hp-fill');
    el.moveMenu = $('move-menu');
    el.cmdBar = $('cmd-bar');
    el.cmdPrompt = $('cmd-prompt');
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
      startBattleTransition();
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
        el.battle.classList.add('opening'); // 가운데 가로선 → 위아래 오픈
        // 4) 다음 틱에 블랙 제거 → 오픈 연출 노출
        setTimeout(function () {
          el.fxBlack.classList.remove('full');
          el.fxBlack.style.display = 'none';
        }, 30);
        // 5) 오픈 완료 후 트레이너 슬라이드 인
        setTimeout(function () {
          el.battle.classList.remove('opening');
          slideInTrainers();
        }, 520);
      }, 470);
    }, 520);
  }

  function setupBattleField() {
    var ch = CHARACTERS[state.charKey];
    state.enemyHp = 100; state.usedMoves = {};
    el.dialog.classList.add('battle');
    // HP 이름은 각 포켓몬 등장 시 설정된다(afterTrainersIn).
    updateEnemyHp();
    el.enemyHpBox.classList.add('hidden-v');
    el.allyHpBox.classList.add('hidden-v');
    el.cmdBar.classList.add('hidden');
    el.enemyArea.style.opacity = '1';

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

  function myPokemonOf(ch) { return DATA.POKEMON[ch.pokemon]; }
  function oppPokemonOf(ch) { return DATA.POKEMON[CHARACTERS[ch.opponentKey].pokemon]; }

  function afterTrainersIn() {
    var ch = CHARACTERS[state.charKey];
    var myPoke = myPokemonOf(ch);
    var oppPoke = oppPokemonOf(ch);
    showMessages([ch.battleIntro], function () {
      // 상대가 먼저 포켓몬을 내보낸다(트레이너 → 포켓몬 정면, 우상)
      showMessages([DATA.josa(ch.opponentName, '은', '는') + ' ' + DATA.josa(oppPoke.name, '을', '를') + '\n내보냈다!'], function () {
        renderSprite(el.enemyArea, oppPoke.frontImg);
        el.enemyHpName.textContent = oppPoke.name;
        el.enemyHpBox.classList.remove('hidden-v');
        // 내가 포켓몬을 내보낸다(트레이너 → 포켓몬 뒷모습, 좌하)
        showMessages([ch.sendOutText], function () {
          renderSprite(el.allyArea, myPoke.backImg);
          el.allyArea.classList.add('lunge');
          setTimeout(function () { el.allyArea.classList.remove('lunge'); }, 400);
          el.allyHpName.textContent = myPoke.name;
          el.allyHpBox.classList.remove('hidden-v');
          openMoveMenu();
        });
      });
    });
  }

  // ================= 배틀(기술) =================
  function openMoveMenu() {
    if (el.cmdPrompt) el.cmdPrompt.textContent = DATA.BATTLE_PROMPT;
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
    if (state.usedMoves[mv.id]) return;
    state.usedMoves[mv.id] = true;
    el.cmdBar.classList.add('hidden');       // 명령 바 숨기고 내레이션으로
    var ch = CHARACTERS[state.charKey];
    showMessages([mv.text(myPokemonOf(ch).name)], function () {
      el.allyArea.classList.add('lunge');
      setTimeout(function () {
        el.allyArea.classList.remove('lunge');
        el.enemyArea.classList.add('shake');
        state.enemyHp = Math.max(0, state.enemyHp - CFG.damagePerMove);
        updateEnemyHp();
        setTimeout(function () {
          el.enemyArea.classList.remove('shake');
          afterMove();
        }, 450);
      }, 300);
    });
  }

  function afterMove() {
    var ch = CHARACTERS[state.charKey];
    if (state.enemyHp <= 0) { victory(ch); return; }
    showMessages(['효과가 굉장했다!'], openMoveMenu);
  }

  function victory(ch) {
    el.cmdBar.classList.add('hidden');
    // 상대 포켓몬 기절: 아래로 내려가며 사라짐
    el.enemyArea.style.transition = 'transform .6s ease, opacity .6s ease';
    el.enemyArea.style.transform = 'translateY(120%)';
    el.enemyArea.style.opacity = '0';
    // 청첩장 버전: "쓰러졌다" 대신
    showMessages(['궁금증이 조금은 해소되었다!'], function () {
      endingSequence(ch);
    });
  }

  // 배틀 종료 → 트레이너 복귀/퇴장 → 흰 화면 → 신랑·신부 나란히 → 마무리 메시지
  function endingSequence(ch) {
    // 포켓몬 → 트레이너 복귀(상대 우상 정면, 나 좌하 뒷모습)
    el.enemyArea.style.transition = 'none';
    el.enemyArea.style.opacity = '1';
    el.enemyArea.style.transform = 'translateX(0)';
    el.allyArea.style.transition = 'none';
    el.allyArea.style.transform = 'translateX(0)';
    renderSprite(el.enemyArea, ch.oppImg);
    renderSprite(el.allyArea, ch.backImg);

    showMessages(['좋은 질문이었어!\n이제 결혼식만 남았네.'], function () {
      // 트레이너 퇴장: 상대는 오른쪽, 나는 왼쪽으로
      el.enemyArea.style.transition = 'transform .6s ease';
      el.allyArea.style.transition = 'transform .6s ease';
      el.enemyArea.style.transform = 'translateX(340%)';
      el.allyArea.style.transform = 'translateX(-340%)';
      el.dialog.classList.add('hidden');
      setTimeout(function () {
        // 흰 화면 fade
        el.fxWhite.classList.add('show');
        setTimeout(function () {
          setScene('ending');
          el.dialog.classList.remove('battle'); // 라이트 대화창
          // 신랑(좌)·신부(우) 준비 — 화면 밖에서 시작
          renderSprite(el.coupleLeft, CHARACTERS.song.frontImg);
          renderSprite(el.coupleRight, CHARACTERS.jo.frontImg);
          el.coupleLeft.style.transition = 'none';
          el.coupleRight.style.transition = 'none';
          el.coupleLeft.style.transform = 'translateX(-200%)';
          el.coupleRight.style.transform = 'translateX(200%)';
          setTimeout(function () {
            // 흰 화면 걷고, 양쪽에서 가운데로 모이기
            el.fxWhite.classList.remove('show');
            void el.coupleLeft.offsetWidth;
            el.coupleLeft.style.transition = 'transform .8s ease';
            el.coupleRight.style.transition = 'transform .8s ease';
            el.coupleLeft.style.transform = 'translateX(0)';
            el.coupleRight.style.transform = 'translateX(0)';
            setTimeout(function () {
              showMessages(
                ['결혼식날 뵙겠습니다.\n감사합니다!', '송현중  ♥  조나영'],
                function () {
                  el.dialogText.innerHTML =
                    '와주셔서 감사합니다 💐\n' +
                    '<a class="cta" href="' + CFG.invitationUrl + '">청첩장 보러가기 ▶</a>';
                }
              );
            }, 900);
          }, 80);
        }, 520);
      }, 680);
    });
  }

  function updateEnemyHp() {
    var hp = state.enemyHp;
    el.enemyHpFill.style.width = hp + '%';
    el.enemyHpFill.classList.remove('mid', 'low');
    if (hp <= 25) el.enemyHpFill.classList.add('low');
    else if (hp <= 50) el.enemyHpFill.classList.add('mid');
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
