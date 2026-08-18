/*
 * data.js — 게임 콘텐츠 데이터 (캐릭터/대사/기술)
 * 순수 데이터만 담는다. 로직은 game.js, 그림은 sprites.js.
 * 클래식 스크립트(비-모듈)로 로드되어 window.GAME_DATA 전역으로 노출된다.
 */
(function () {
  'use strict';

  // 선택 가능한 두 명(예비 신랑/신부). key 로 CHARACTERS 를 참조한다.
  var CHOICES = [
    { key: 'song', label: '송현중' },
    { key: 'jo', label: '조나영' },
  ];

  var CHARACTERS = {
    song: {
      key: 'song',
      name: '송현중',
      // 오박사 확인 질문 (\n = 줄바꿈)
      confirmText: 'LG CNS에서 인프라 아키텍트로\n일하고 있는 송현중이 맞니?',
      // 배틀 진입 문구 (상대 = 나를 뺀 나머지)
      opponentName: '예비 신부',
      battleIntro: '야생의 예비 신부가\n배틀을 신청했다!',
      // 내가 내보내는 포켓몬
      ourName: '잉어킹',
      sendOutText: '나와라 잉어킹!',
      ourSprite: 'magikarp',
      opponentSprite: 'bride',
    },
    jo: {
      key: 'jo',
      name: '조나영',
      confirmText: '크레아 스튜디오에서 PD로\n일하고 있는 조나영이 맞니?',
      opponentName: '예비 신랑',
      battleIntro: '야생의 예비 신랑이\n배틀을 신청했다!',
      ourName: '밴드왕',
      sendOutText: '나와라 밴드왕!',
      ourSprite: 'bandwang', // 거북왕 모양, 이름은 밴드왕
      opponentSprite: 'groom',
    },
  };

  // 배틀 메뉴 4칸: 신혼집 / 신혼여행 / 미정 / 미정 (2x2)
  // text(us) = 우리 포켓몬 이름을 받아 공격 대사를 만든다. 각 기술은 25% 데미지.
  var MOVES = [
    {
      id: 'newhome',
      label: '신혼집',
      text: function (us) { return us + '의 몸통박치기!'; },
      tbd: false,
    },
    {
      id: 'honeymoon',
      label: '신혼여행',
      text: function (us) { return us + '의 물대포!'; },
      tbd: false,
    },
    {
      id: 'tbd1',
      label: '미정',
      text: function (us) { return us + '는 두근두근 몸을 웅크렸다!\n(아직 준비 중인 기술)'; },
      tbd: true, // 나중에 실제 항목으로 교체 예정
    },
    {
      id: 'tbd2',
      label: '미정',
      text: function (us) { return us + '는 힘을 모으고 있다!\n(아직 준비 중인 기술)'; },
      tbd: true,
    },
  ];

  var CONFIG = {
    damagePerMove: 25,       // 기술 1회당 상대 체력 감소량(%)
    typeSpeedMs: 28,         // 타자기 효과 글자당 지연(ms)
    invitationUrl: '../',    // 승리 후 '청첩장 보러가기' 링크 (배포 시 사이트 루트)
  };

  window.GAME_DATA = {
    CHOICES: CHOICES,
    CHARACTERS: CHARACTERS,
    MOVES: MOVES,
    CONFIG: CONFIG,
  };
})();
