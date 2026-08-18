/*
 * data.js — 게임 콘텐츠 데이터 (캐릭터/대사/기술/에셋 경로)
 * 순수 데이터만 담는다. 로직은 game.js, 그림은 sprites.js.
 * window.GAME_DATA 전역으로 노출.
 *
 * [에셋/저작권] 캐릭터 이미지는 assets/*.png 를 불러오되, 파일이 없으면
 * sprites.js 의 오리지널 SVG 로 자동 대체된다(실제 게임 스프라이트 미포함).
 */
(function () {
  'use strict';

  // 받침 유무에 따라 한글 조사 선택 (은/는, 을/를, 이/가 등)
  function hasBatchim(str) {
    if (!str) return false;
    var c = str.charCodeAt(str.length - 1);
    if (c < 0xac00 || c > 0xd7a3) return false; // 한글 음절 아님
    return (c - 0xac00) % 28 !== 0;
  }
  function josa(word, withB, withoutB) {
    return word + (hasBatchim(word) ? withB : withoutB);
  }

  // 오박사 인트로 대사(순차). 마지막 줄 뒤 오박사 fade-out → 신랑/신부 질문.
  var INTRO_LINES = [
    '안녕!',
    '나는 포켓몬을 연구하는\n오박사란다.',
    '두 사람의 결혼식에 온 걸\n진심으로 환영한다!',
    '그럼 먼저 주인공들에 대해\n알아보자꾸나!',
  ];

  // 신랑/신부 질문 + 선택지(대화창 우측 위 오버랩)
  var GENDER_QUESTION = '너는 신랑인가?\n그게 아니면 신부인가?';
  var CHOICES = [
    { key: 'song', label: '송현중(신랑)' },
    { key: 'jo', label: '조나영(신부)' },
  ];

  // 포켓몬: 뒷모습(내 쪽, 좌하) / 정면(상대 쪽, 우상) 이미지 슬롯 + SVG 폴백
  var POKEMON = {
    charmander: {
      name: '파이리', // 송현중의 포켓몬
      backImg: { asset: 'assets/charmander-back.png', svg: 'charmander' },
      frontImg: { asset: 'assets/charmander-front.png', svg: 'charmander' },
    },
    bandwang: {
      name: '밴드왕', // 조나영의 포켓몬 (거북왕 모양)
      backImg: { asset: 'assets/bandwang-back.png', svg: 'bandwang' },
      frontImg: { asset: 'assets/bandwang-front.png', svg: 'bandwang' },
    },
  };

  // 배틀 명령 프롬프트(하단 좌측 패널) — 원작 "What will X do?" 자리
  var BATTLE_PROMPT = '무엇을 물어볼까?';

  var CHARACTERS = {
    song: {
      key: 'song',
      name: '송현중',
      gender: '신랑',
      opponentKey: 'jo',
      confirmText: 'LG CNS에서 인프라 아키텍트로\n일하고 있는 송현중이 맞니?',
      // 상대 = 조나영(신부)
      opponentName: '조나영',
      opponentGender: '신부',
      battleIntro: '신부 조나영(이)가\n승부를 걸어왔다!',
      // 내 포켓몬
      pokemon: 'charmander',
      sendOutText: '나와라 파이리!',
      // 트레이너 이미지 슬롯 — 정면/뒷모습 + 상대 정면
      frontImg: { asset: 'assets/song-front.png', svg: 'trainerMaleFront' },
      backImg: { asset: 'assets/song-back.png', svg: 'trainerMaleBack' },
      oppImg: { asset: 'assets/jo-front.png', svg: 'trainerFemaleFront' },
    },
    jo: {
      key: 'jo',
      name: '조나영',
      gender: '신부',
      opponentKey: 'song',
      confirmText: '크레아 스튜디오에서 PD로\n일하고 있는 조나영이 맞니?',
      // 상대 = 송현중(신랑)
      opponentName: '송현중',
      opponentGender: '신랑',
      battleIntro: '신랑 송현중(이)가\n승부를 걸어왔다!',
      pokemon: 'bandwang',
      sendOutText: '나와라 밴드왕!',
      frontImg: { asset: 'assets/jo-front.png', svg: 'trainerFemaleFront' },
      backImg: { asset: 'assets/jo-back.png', svg: 'trainerFemaleBack' },
      oppImg: { asset: 'assets/song-front.png', svg: 'trainerMaleFront' },
    },
  };

  // 오박사 이미지 슬롯
  var OAK_IMG = { asset: 'assets/oak.png', svg: 'oak' };

  // 배틀 메뉴 4칸: 신혼집 / 신혼여행 / 미정 / 미정 (2x2). 각 25% 데미지.
  var MOVES = [
    { id: 'newhome', label: '신혼집 어디야?', text: function (us) { return josa(us, '은', '는') + ' "신혼집 어디야?"\n라고 캐물었다!'; }, tbd: false },
    { id: 'honeymoon', label: '신혼여행 언제가?', text: function (us) { return josa(us, '은', '는') + ' "신혼여행 언제가?"\n라고 캐물었다!'; }, tbd: false },
    { id: 'tbd1', label: '미정', text: function (us) { return josa(us, '은', '는') + ' 아직 못 정한 걸 물었다...\n(준비 중인 질문)'; }, tbd: true },
    { id: 'tbd2', label: '미정', text: function (us) { return josa(us, '은', '는') + ' 아직 못 정한 걸 물었다...\n(준비 중인 질문)'; }, tbd: true },
  ];

  var CONFIG = {
    damagePerMove: 25,
    typeSpeedMs: 28,
    invitationUrl: '../',
  };

  window.GAME_DATA = {
    josa: josa,
    INTRO_LINES: INTRO_LINES,
    GENDER_QUESTION: GENDER_QUESTION,
    CHOICES: CHOICES,
    CHARACTERS: CHARACTERS,
    POKEMON: POKEMON,
    BATTLE_PROMPT: BATTLE_PROMPT,
    OAK_IMG: OAK_IMG,
    MOVES: MOVES,
    CONFIG: CONFIG,
  };
})();
