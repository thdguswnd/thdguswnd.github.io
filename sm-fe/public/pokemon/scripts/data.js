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
    '두 사람의 결혼식에 온 걸\n진심으로 환영한다!',
    '그럼 먼저 주인공들에 대해\n알아보자꾸나!',
  ];

  // 신랑/신부 질문 + 선택지(대화창 우측 위 오버랩)
  var GENDER_QUESTION = '신랑이 궁금해?\n아니면 신부가 궁금해?';
  var CHOICES = [
    { key: 'song', label: '신랑 송현중' },
    { key: 'jo', label: '신부 조나영' },
  ];

  // 배틀 명령 프롬프트(하단 좌측 패널) — 원작 "What will X do?" 자리
  var BATTLE_PROMPT = 'PP      40/40\n기술타입/노말';

  var CHARACTERS = {
    song: {
      key: 'song',
      name: '송현중',
      gender: '신랑',
      level: 37,
      opponentKey: 'jo',
      confirmText: '마곡에 위치한 LG CNS에서 일하고 있는\n신랑 송현중이 궁금한 게 맞니?',
      // '네' 선택 후 오박사 반응
      postConfirm: [
        'IT쪽 일을 하지만 개발자는 아니고,\n개발자들이 일할 수 있게',
        '클라우드, 서버 같은 걸\n구성해 주는 일을 한다고 해!',
        '무슨 말인지 모르겠지만\n넘어가자!',
      ],
      // 선택 시 이 사람이 "상대(우상)"가 되어 질문을 받는다
      opponentName: '조나영',
      opponentGender: '신부',
      battleIntro: '신랑 송현중에게\n궁금한 걸 물어보자!',
      // 트레이너 이미지 슬롯 — 정면/뒷모습 + 상대 정면
      frontImg: { asset: 'assets/song-front.png', svg: 'trainerMaleFront' },
      backImg: { asset: 'assets/song-back.png', svg: 'trainerMaleBack' },
      oppImg: { asset: 'assets/jo-front.png', svg: 'trainerFemaleFront' },
    },
    jo: {
      key: 'jo',
      name: '조나영',
      gender: '신부',
      level: 30,
      opponentKey: 'song',
      confirmText: '크레아 스튜디오에서 예능 PD로\n일하고 있는 신부 조나영이 궁금한 게 맞니?',
      postConfirm: [
        '요즘은 SBS 한일 밴드 오디션 프로그램\n<밴드왕>을 준비하느라,',
        '지금도 일하는 중이라는구나!\n많관부!',
      ],
      // 선택 시 이 사람이 "상대(우상)"가 되어 질문을 받는다
      opponentName: '송현중',
      opponentGender: '신랑',
      battleIntro: '신부 조나영에게\n궁금한 걸 물어보자!',
      frontImg: { asset: 'assets/jo-front.png', svg: 'trainerFemaleFront' },
      backImg: { asset: 'assets/jo-back.png', svg: 'trainerFemaleBack' },
      oppImg: { asset: 'assets/song-front.png', svg: 'trainerMaleFront' },
    },
  };

  // 오박사 이미지 슬롯
  var OAK_IMG = { asset: 'assets/oak.png', svg: 'oak' };

  // 배틀 질문(2x2): 인물별로 다름. 스크립트는 일단 (준비중) 플레이스홀더.
  // ask() = 질문 대사, answer() = 답변 대사(배열=여러 줄). 나중에 내용 채우면 됨.
  function makeQ(id, label) {
    return {
      id: id,
      label: label,
      ask: function () { return '(질문 준비중)'; },
      answer: function () { return ['(답변 준비중)']; },
    };
  }
  var FLEE = { id: 'flee', label: '도망친다', flee: true };

  // 신랑(송현중) 선택 시: 질문1~3, 신부(조나영) 선택 시: 질문4~6
  CHARACTERS.song.moves = [makeQ('q1', '질문1'), makeQ('q2', '질문2'), makeQ('q3', '질문3'), FLEE];
  CHARACTERS.jo.moves = [makeQ('q4', '질문4'), makeQ('q5', '질문5'), makeQ('q6', '질문6'), FLEE];

  // 엔딩 멘트 (배틀 다음 화면)
  var ENDING_LINES = [
    '신랑, 신부의 이야기를\n들어주셔서 감사합니다!',
    '더 자세한 얘기는\n만나서 들려드릴게요!',
    '결혼식날 뵙겠습니다,\n감사합니다!',
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
    BATTLE_PROMPT: BATTLE_PROMPT,
    OAK_IMG: OAK_IMG,
    ENDING_LINES: ENDING_LINES,
    CONFIG: CONFIG,
  };
})();
