/*
 * game.js — 상태 머신 + 렌더링 + 입력(터치/클릭)
 * 화면 흐름: INTRO(이름 묻기) → CONFIRM(확인) → BATTLE_INTRO → BATTLE(4기술) → VICTORY
 * 조작은 모두 터치/클릭. window.GAME_DATA / window.GAME_SPRITES 에 의존.
 */
(function () {
  'use strict';

  var DATA = window.GAME_DATA;
  var SPRITES = window.GAME_SPRITES;
  var CFG = DATA.CONFIG;

  // ---- 전역 상태 ----
  var state = {
    scene: 'intro',      // intro | confirm | battle
    charKey: null,       // 'song' | 'jo'
    enemyHp: 100,        // 상대 체력(%)
    usedMoves: {},       // { moveId: true }
    busy: false,         // 대사 재생/애니 중 입력 잠금
  };

  // ---- DOM 참조 ----
  var el = {};
  function $(id) { return document.getElementById(id); }

  function cacheDom() {
    el.sceneIntro = $('scene-intro');
    el.sceneBattle = $('scene-battle');
    el.oak = $('oak-sprite');
    el.choiceBox = $('choice-box');
    el.yesnoBox = $('yesno-box');
    el.dialog = $('dialog-box');
    el.dialogText = $('dialog-text');
    el.dialogArrow = $('dialog-arrow');
    el.enemyArea = $('enemy-area');
    el.allyArea = $('ally-area');
    el.enemyHpBox = $('enemy-hp-box');
    el.allyHpBox = $('ally-hp-box');
    el.enemyHpName = $('enemy-hp-name');
    el.allyHpName = $('ally-hp-name');
    el.enemyHpFill = $('enemy-hp-fill');
    el.moveMenu = $('move-menu');
  }

  // ---- 타자기 효과가 있는 메시지 큐 ----
  // showMessages([str, str, ...], onDone) : 탭으로 한 줄씩 진행
  var typing = { timer: null, active: false };

  function typeLine(text, onComplete) {
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
        if (onComplete) onComplete();
      }
    }, CFG.typeSpeedMs);
  }

  // 여러 메시지를 순차로. 마지막 메시지까지 확인하면 done() 호출.
  function showMessages(messages, done) {
    var idx = 0;
    state.busy = true;
    function render() { typeLine(messages[idx], null); }
    render();
    // 대화창 탭 핸들러(이 시퀀스 동안만)
    function onTap() {
      if (typing.active) {
        // 타자 중이면 즉시 완성
        clearInterval(typing.timer);
        typing.active = false;
        el.dialogText.textContent = messages[idx];
        el.dialogArrow.classList.add('blink');
        return;
      }
      idx++;
      if (idx < messages.length) {
        render();
      } else {
        el.dialog.removeEventListener('click', onTap);
        el.dialogArrow.classList.remove('blink');
        state.busy = false;
        if (done) done();
      }
    }
    el.dialog.addEventListener('click', onTap);
  }

  // ---- 장면 전환 ----
  function setScene(name) {
    state.scene = name;
    el.sceneIntro.classList.toggle('hidden', name === 'battle');
    el.sceneBattle.classList.toggle('hidden', name !== 'battle');
  }

  // ================= INTRO =================
  function startIntro() {
    setScene('intro');
    el.oak.innerHTML = SPRITES.oak;
    el.oak.classList.remove('dim');
    el.choiceBox.classList.add('hidden');
    el.yesnoBox.classList.add('hidden');
    showMessages(
      [
        '안녕! 잘 왔단다.\n이 세계에 온 걸 환영한다!',
        '나는 이 마을에서\n포켓몬을 연구하는 오박사란다.',
        '그런데... 네 이름이 뭐였지?',
      ],
      function () {
        // 이름 선택지 표시(대화창 우측 위 오버랩)
        renderChoices();
      }
    );
  }

  function renderChoices() {
    el.choiceBox.innerHTML = '';
    DATA.CHOICES.forEach(function (c) {
      var item = document.createElement('div');
      item.className = 'choice-item';
      item.textContent = c.label;
      item.addEventListener('click', function () { onChooseName(c.key); });
      el.choiceBox.appendChild(item);
    });
    el.choiceBox.classList.remove('hidden');
  }

  // ================= CONFIRM =================
  function onChooseName(key) {
    if (state.busy) return;
    state.charKey = key;
    el.choiceBox.classList.add('hidden');
    var ch = DATA.CHARACTERS[key];
    showMessages(['오박사: ' + ch.confirmText], function () {
      renderYesNo();
    });
  }

  function renderYesNo() {
    el.yesnoBox.innerHTML = '';
    var yes = makeChoice('네', function () {
      el.yesnoBox.classList.add('hidden');
      goBattle();
    });
    var no = makeChoice('아니오', function () {
      el.yesnoBox.classList.add('hidden');
      // 이전 선택 화면으로
      showMessages(['그렇구나! 그럼 다시 물어보마.'], function () {
        state.charKey = null;
        renderChoices();
      });
    });
    el.yesnoBox.appendChild(yes);
    el.yesnoBox.appendChild(no);
    el.yesnoBox.classList.remove('hidden');
  }

  function makeChoice(label, onClick) {
    var item = document.createElement('div');
    item.className = 'choice-item';
    item.textContent = label;
    item.addEventListener('click', onClick);
    return item;
  }

  // ================= BATTLE =================
  function goBattle() {
    var ch = DATA.CHARACTERS[state.charKey];
    state.enemyHp = 100;
    state.usedMoves = {};

    setScene('battle');
    // 스프라이트 세팅
    el.enemyArea.innerHTML = SPRITES[ch.opponentSprite];
    el.allyArea.innerHTML = '';   // 아군은 '나와라' 대사 후 등장
    el.moveMenu.classList.add('hidden');

    // HP 박스 초기화(상대만 감소, 아군은 100% 고정)
    el.enemyHpName.textContent = ch.opponentName;
    el.allyHpName.textContent = ch.ourName;
    updateEnemyHp();
    el.enemyHpBox.style.visibility = 'hidden';
    el.allyHpBox.style.visibility = 'hidden';

    showMessages([ch.battleIntro], function () {
      el.enemyHpBox.style.visibility = 'visible';
      showMessages([ch.sendOutText], function () {
        // 아군 등장
        el.allyArea.innerHTML = SPRITES[ch.ourSprite];
        el.allyArea.classList.add('lunge');
        setTimeout(function () { el.allyArea.classList.remove('lunge'); }, 400);
        el.allyHpBox.style.visibility = 'visible';
        showMessages(['어떻게 할까?'], function () {
          openMoveMenu();
        });
      });
    });
  }

  function openMoveMenu() {
    el.moveMenu.innerHTML = '';
    DATA.MOVES.forEach(function (mv, i) {
      var item = document.createElement('div');
      item.className = 'move-item';
      var used = !!state.usedMoves[mv.id];
      if (used) item.classList.add('disabled');
      item.textContent = mv.label;
      if (!used) {
        item.addEventListener('click', function () { onUseMove(i); });
      }
      el.moveMenu.appendChild(item);
    });
    el.moveMenu.classList.remove('hidden');
  }

  function onUseMove(index) {
    if (state.busy) return;
    var mv = DATA.MOVES[index];
    if (state.usedMoves[mv.id]) return;
    state.usedMoves[mv.id] = true;
    el.moveMenu.classList.add('hidden');

    var ch = DATA.CHARACTERS[state.charKey];
    showMessages([mv.text(ch.ourName)], function () {
      // 아군 돌진 → 상대 흔들림 → HP 감소
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
    var ch = DATA.CHARACTERS[state.charKey];
    if (state.enemyHp <= 0) {
      victory(ch);
      return;
    }
    // 남은 기술이 있으면 다시 메뉴
    showMessages(['효과가 굉장했다!'], function () {
      openMoveMenu();
    });
  }

  function victory(ch) {
    el.enemyArea.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    el.enemyArea.style.opacity = '0';
    el.enemyArea.style.transform = 'translateY(30%)';
    showMessages(
      [
        '야생의 ' + ch.opponentName + '은(는)\n쓰러졌다!',
        state.charKey === 'song'
          ? '송현중은(는) 배틀에서 승리했다!'
          : '조나영은(는) 배틀에서 승리했다!',
        '두 사람의 새로운 모험이\n곧 시작됩니다. 💍',
      ],
      function () {
        el.dialogText.innerHTML =
          '축하의 마음을 전해주세요!\n' +
          '<a class="cta" href="' + CFG.invitationUrl + '">청첩장 보러가기 ▶</a>';
      }
    );
  }

  // ---- HP 표시 갱신 ----
  function updateEnemyHp() {
    var hp = state.enemyHp;
    el.enemyHpFill.style.width = hp + '%';
    el.enemyHpFill.classList.remove('mid', 'low');
    if (hp <= 25) el.enemyHpFill.classList.add('low');
    else if (hp <= 50) el.enemyHpFill.classList.add('mid');
  }

  // ---- 부팅 ----
  function boot() {
    cacheDom();
    startIntro();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
