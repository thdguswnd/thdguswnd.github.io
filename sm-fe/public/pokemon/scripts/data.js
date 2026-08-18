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
  var GENDER_QUESTION = '그대는 신랑이니?\n아니면 신부인가?';
  var CHOICES = [
    { key: 'song', label: '송현중(신랑)' },
    { key: 'jo', label: '조나영(신부)' },
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
      confirmText: '마곡에 있는 LG CNS에서 인프라 아키텍트로\n일하고 있는 송현중이 맞니?',
      // '네' 선택 후 오박사 반응
      postConfirm: [
        'IT쪽 일을 하지만 개발자는 아니고,\n개발자들이 일할 수 있게',
        '클라우드, 서버 같은 걸\n구성해 주는 일을 하는구나!',
        '무슨 말인지 모르겠지만\n넘어가자!',
      ],
      // 상대 = 조나영(신부)
      opponentName: '조나영',
      opponentGender: '신부',
      battleIntro: '신부 조나영에게\n궁금한 걸 물어보자!',
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
      confirmText: '홍대에 있는 크레아 스튜디오에서 PD로\n일하고 있는 조나영이 맞니?',
      postConfirm: [
        '한일가왕전, 한일로맨스 혼전연애,\n쉬는부부, 불타는 장미단 등',
        '여러 프로그램을 연출한 PD구나!\n근사하다!',
      ],
      // 상대 = 송현중(신랑)
      opponentName: '송현중',
      opponentGender: '신랑',
      battleIntro: '신랑 송현중에게\n궁금한 걸 물어보자!',
      frontImg: { asset: 'assets/jo-front.png', svg: 'trainerFemaleFront' },
      backImg: { asset: 'assets/jo-back.png', svg: 'trainerFemaleBack' },
      oppImg: { asset: 'assets/song-front.png', svg: 'trainerMaleFront' },
    },
  };

  // 오박사 이미지 슬롯
  var OAK_IMG = { asset: 'assets/oak.png', svg: 'oak' };

  // 배틀 메뉴 4칸: 신혼집 / 신혼여행 / 미정 / 미정 (2x2). 각 25% 데미지.
  // 각 질문: ask(me) = 선택한 사람이 물음(공격), answer(opp) = 안 선택한 사람이 대답(반격, 배열=여러 줄)
  var MOVES = [
    {
      id: 'newhome', label: '신혼집',
      ask: function (me) { return josa(me, '은', '는') + ' 신혼집을 어디에 구했는지\n물어봤다!'; },
      answer: function (opp) {
        return [
          josa(opp, '은', '는') + ' 작고 귀여운 신혼집을\n강서구 9호선 가양역 근처에 구했다고 답했다!',
        ];
      },
    },
    {
      id: 'honeymoon', label: '신혼여행',
      ask: function (me) { return josa(me, '은', '는') + ' 신혼여행을 어디 가는지\n물어봤다!'; },
      answer: function (opp) {
        return [
          josa(opp, '은', '는') + ' 신부가 준비 중인 방송이 있어서,\n신혼여행은 내년 3~4월쯤 갈 계획이라 답했다!',
          '그래도 안 가면 아쉬우니까, 결혼식 끝나고\n오키나와를 짧게 다녀오고 싶다고 덧붙였다!',
        ];
      },
    },
    {
      id: 'bandshow', label: '밴드왕',
      ask: function (me) { return josa(me, '은', '는') + ' 밴드왕이 뭐냐고\n물어봤다!'; },
      answer: function (opp) {
        return [
          josa(opp, '은', '는') + " 'SBS 한일 밴드 오디션 밴드왕'은\n신부가 준비 중인 방송이라고 답했다!",
          '한국과 일본의 실력파 뮤지션들이\n국경·장르·나이·경력·성별을 뛰어넘어',
          '세상에 없던 단 하나의 한일 밴드를 결성하는\n초특급 음악 서바이벌 프로그램이다!',
          '많관부!',
        ];
      },
    },
    { id: 'flee', label: '도망친다', flee: true },
  ];

  // 엔딩 멘트 (배틀 다음 화면)
  var ENDING_LINES = [
    '나머지 이야기는\n만나서 들려드릴게요.',
    '결혼식날 뵙겠습니다.\n감사합니다!',
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
    MOVES: MOVES,
    ENDING_LINES: ENDING_LINES,
    CONFIG: CONFIG,
  };
})();
