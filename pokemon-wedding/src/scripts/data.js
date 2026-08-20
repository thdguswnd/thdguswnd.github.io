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
  var GENDER_QUESTION = '신랑이 궁금하니?\n아니면 신부가 궁금하니?';
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
      confirmText: 'LG CNS에서 인프라 아키텍트로 일하고 있는\n신랑 송현중이 궁금한 게 맞니?',
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
        '예비 신랑보다 편집기랑 있는 시간이\n더 길다는 얘기가 있던데..',
        '슬프니까 넘어가자!',
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

  // 배틀 질문(2x2): 인물별로 다름. ask()=질문 대사, answer()=답변 대사(배열=여러 줄).
  // ('신부(은)는' / '신랑(은)는' 표기는 게임화면 오마주라 그대로 유지)
  function q(id, label, ask, answer) {
    return { id: id, label: label, ask: function () { return ask; }, answer: function () { return answer; } };
  }
  var FLEE = { id: 'flee', label: '도망친다', flee: true };

  // 신랑(송현중) 선택 시
  CHARACTERS.song.moves = [
    q('q1', '첫만남', '둘은 어떻게 처음 만났는지\n물어봤다!', [
      '신랑(은)는 크로스핏을 하다가\n만났다고 대답했다!',
      '신부가 갓 태어난 기린처럼\n펄럭거리는 모습이 귀여웠다고 회상했다!',
    ]),
    q('q2', '청첩장', '청첩장은 누구 아이디어인지\n물어봤다!', [
      '신랑(은)는 본인 결혼식이라\n하고 싶은 거 다 해봤다고 대답했다!',
      '막상 저지르고 보니 남들처럼\n평범하게 할껄 그랬나 싶은 눈치다.',
      '딱하니까 잘했다고\n칭찬해주자!',
    ]),
    q('q3', '다이어트', '운동이 취미라면서\n그 뱃살은 무슨 일이냐고 물어봤다!', [
      '신랑(은)는 갑자기 세상에\n맛있는 게 너무 많다고 한탄했다!',
      '그러면서 결혼식장 뷔페도\n맛있기로 유명하다고,',
      '맥주랑 와인도 마시고 가라고\n어필했다!',
    ]),
    FLEE,
  ];

  // 신부(조나영) 선택 시
  CHARACTERS.jo.moves = [
    q('q4', '프러포즈', '프러포즈는 어떻게 받았는지\n물어봤다!', [
      '신부(은)는 이집트 사막에서\n텐트치고 잔 다음날,',
      '일출을 보며 프러포즈를\n받았다고 대답했다!',
      '눈꼽도 안 떼고 세상\n꼬질꼬질했었다고 덧붙였다!',
      '그게 사랑이지.',
    ]),
    q('q5', '신혼여행', '신혼여행은 어디로 가는지\n물어봤다!', [
      '신부(은)는 현재 준비 중인 방송이 끝나고,\n내년 3~4월에 갈 계획이라고 대답했다!',
      '그치만 결혼식 끝나고 어디든\n짧게라도 다녀오고 싶은 눈치다!',
      '(회사분들 보고계신가요?)',
    ]),
    q('q6', '밴드왕', '현재 준비 중인 방송에 대해서\n물어봤다!', [
      '신부(은)는 현재 한일 밴드 오디션\n<밴드왕>을 준비 중이고,',
      'SBS에서 내년 1월 중\n첫 방송 예정이라고 대답했다!',
      '많관부!',
    ]),
    FLEE,
  ];

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
