/*
 * sprites.js — 캐릭터 그림 (오리지널 SVG 아트)
 * 저작권 안내: 실제 게임 스프라이트를 그대로 옮기지 않고, 도트풍을 흉내 낸
 * 오리지널 도형 기반 오마주 아트다. window.GAME_SPRITES[key] = SVG 문자열.
 * 각 SVG 는 컨테이너를 꽉 채우도록 width/height 100% 로 렌더된다.
 */
(function () {
  'use strict';

  function wrap(vb, inner) {
    return (
      '<svg viewBox="' + vb + '" width="100%" height="100%" ' +
      'preserveAspectRatio="xMidYMid meet" shape-rendering="geometricPrecision" ' +
      'xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>'
    );
  }

  // 박사 — 밝은 머리 + 흰 가운 + 보라 셔츠(오리지널 도트풍)
  var oak = wrap('0 0 96 128',
    '<path d="M36 118 h17 v7 H34 Z" fill="#3f2920"/>' +
    '<path d="M62 118 h17 v7 H60 Z" fill="#3f2920"/>' +
    '<path d="M38 70 h18 l-3 50 H36 Z" fill="#978146" stroke="#57492f" stroke-width="3"/>' +
    '<path d="M58 70 h18 l5 50 H62 Z" fill="#8f793f" stroke="#57492f" stroke-width="3"/>' +
    '<path d="M36 46 h40 l-4 32 H40 Z" fill="#7661ac" stroke="#493c77" stroke-width="3"/>' +
    '<path d="M34 45 L16 62 L23 115 H45 L47 74 L49 115 H75 L82 62 L64 45 L57 55 L48 52 L39 55 Z" fill="#f7fbff" stroke="#627089" stroke-width="3"/>' +
    '<path d="M38 55 L28 82 L22 80 L30 51 Z" fill="#dbe8f5"/>' +
    '<path d="M62 55 L72 83 L80 78 L67 51 Z" fill="#dbe8f5"/>' +
    '<path d="M20 78 L9 84 L4 80 L16 69 Z" fill="#f2c49f" stroke="#71442e" stroke-width="3"/>' +
    '<path d="M7 78 l-6 5 M12 75 l-5 -7" stroke="#71442e" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M75 78 L88 82 L91 75 L78 68 Z" fill="#f2c49f" stroke="#71442e" stroke-width="3"/>' +
    '<path d="M42 42 h24 v15 H42 Z" fill="#eab68e" stroke="#6d442f" stroke-width="3"/>' +
    '<path d="M31 19 L26 32 L31 47 L43 55 H61 L73 47 L78 32 L72 19 L62 12 H41 Z" fill="#f0c49d" stroke="#6d442f" stroke-width="3"/>' +
    '<path d="M28 21 h8 v-7 h10 V8 h22 v5 h8 v10 h5 v14 h-8 V26 H34 v11 h-7 Z" fill="#d9d1a5" stroke="#7d7658" stroke-width="3"/>' +
    '<path d="M32 26 h8 v-5 h18 v4 h14 v7 H55 v4 H38 v-4 h-6 Z" fill="#eee7bb"/>' +
    '<rect x="39" y="34" width="6" height="6" fill="#443232"/>' +
    '<rect x="61" y="34" width="6" height="6" fill="#443232"/>' +
    '<path d="M43 49 q10 7 20 0" fill="none" stroke="#7b4938" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M37 29 h10 M59 29 h11" stroke="#5d4d3a" stroke-width="3" stroke-linecap="round"/>'
  );

  // 잉어킹(오마주) — 주황 물고기, 큰 입술, 노란 수염
  var magikarp = wrap('0 0 128 92',
    // 꼬리지느러미
    '<path d="M96 46 L126 18 L118 46 L126 74 Z" fill="#f7c14b" stroke="#3a2a12" stroke-width="3" stroke-linejoin="round"/>' +
    // 몸통
    '<ellipse cx="56" cy="48" rx="46" ry="27" fill="#f28c1e" stroke="#3a2a12" stroke-width="3"/>' +
    // 등지느러미
    '<path d="M44 23 L58 5 L72 23 Z" fill="#f7c14b" stroke="#3a2a12" stroke-width="3" stroke-linejoin="round"/>' +
    // 가슴지느러미
    '<path d="M52 63 L46 86 L70 70 Z" fill="#f7c14b" stroke="#3a2a12" stroke-width="3" stroke-linejoin="round"/>' +
    // 비늘 곡선
    '<path d="M40 26 Q62 48 40 70" fill="none" stroke="#d5761a" stroke-width="3"/>' +
    // 입술
    '<ellipse cx="15" cy="53" rx="13" ry="9" fill="#f6d9a0" stroke="#3a2a12" stroke-width="3"/>' +
    '<path d="M4 53 h22" stroke="#3a2a12" stroke-width="2"/>' +
    // 수염(바벨)
    '<path d="M9 61 q-7 9 -3 19" fill="none" stroke="#f7c14b" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M22 63 q-3 11 -12 17" fill="none" stroke="#f7c14b" stroke-width="4" stroke-linecap="round"/>' +
    // 눈
    '<circle cx="36" cy="38" r="9" fill="#ffffff" stroke="#3a2a12" stroke-width="3"/>' +
    '<circle cx="36" cy="38" r="4" fill="#3a2a12"/>'
  );

  // 밴드왕(거북왕 오마주) — 파란 거북 + 갈색 등껍질 + 어깨 대포
  var bandwang = wrap('0 0 120 104',
    // 뒷다리/발
    '<ellipse cx="44" cy="94" rx="13" ry="9" fill="#79c2d4" stroke="#1c3a44" stroke-width="3"/>' +
    '<ellipse cx="88" cy="94" rx="13" ry="9" fill="#79c2d4" stroke="#1c3a44" stroke-width="3"/>' +
    // 등껍질
    '<ellipse cx="66" cy="58" rx="46" ry="36" fill="#8a5a2b" stroke="#3a2412" stroke-width="3"/>' +
    '<path d="M28 58 h76 M66 24 v68 M40 34 L92 82 M92 34 L40 82" stroke="#6d4520" stroke-width="2" fill="none"/>' +
    // 어깨 대포
    '<rect x="86" y="30" width="26" height="13" rx="4" fill="#aab2ba" stroke="#1c3a44" stroke-width="3"/>' +
    '<rect x="86" y="60" width="26" height="13" rx="4" fill="#aab2ba" stroke="#1c3a44" stroke-width="3"/>' +
    // 머리
    '<circle cx="26" cy="50" r="19" fill="#79c2d4" stroke="#1c3a44" stroke-width="3"/>' +
    // 눈
    '<circle cx="18" cy="45" r="3.4" fill="#12303a"/>' +
    '<circle cx="31" cy="45" r="3.4" fill="#12303a"/>' +
    // 입
    '<path d="M15 57 q10 6 20 0" fill="none" stroke="#12303a" stroke-width="2.5" stroke-linecap="round"/>'
  );

  // 예비 신부 — 흰 드레스 + 면사포 + 부케
  var bride = wrap('0 0 80 108',
    // 면사포
    '<path d="M40 6 C12 12 16 76 22 100 L58 100 C64 76 68 12 40 6 Z" fill="#eef2f7" stroke="#c3ccd6" stroke-width="2" opacity="0.85"/>' +
    // 드레스
    '<path d="M40 42 L20 100 L60 100 Z" fill="#ffffff" stroke="#cbd0d8" stroke-width="2"/>' +
    // 어깨/팔
    '<path d="M31 50 L22 74" stroke="#f7e9de" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M49 50 L58 74" stroke="#f7e9de" stroke-width="6" stroke-linecap="round"/>' +
    // 얼굴
    '<circle cx="40" cy="30" r="14" fill="#f6cfa6" stroke="#c99b6e" stroke-width="2"/>' +
    // 머리(앞머리)
    '<path d="M26 28 Q28 12 40 12 Q52 12 54 28 Q48 20 40 20 Q32 20 26 28 Z" fill="#5a3b26" stroke="#3f2817" stroke-width="1.5"/>' +
    // 눈/미소
    '<circle cx="35" cy="31" r="2.2" fill="#2b2b2b"/>' +
    '<circle cx="45" cy="31" r="2.2" fill="#2b2b2b"/>' +
    '<path d="M36 37 q4 3 8 0" fill="none" stroke="#b5677a" stroke-width="2" stroke-linecap="round"/>' +
    // 부케
    '<circle cx="40" cy="72" r="8" fill="#f4a6c0" stroke="#d6789a" stroke-width="2"/>' +
    '<circle cx="34" cy="70" r="4" fill="#f7c1d4"/>' +
    '<circle cx="46" cy="70" r="4" fill="#f7c1d4"/>' +
    '<path d="M40 78 v12" stroke="#4f7a3a" stroke-width="3"/>'
  );

  // 예비 신랑 — 어두운 정장 + 나비넥타이
  var groom = wrap('0 0 80 108',
    // 정장 몸통
    '<path d="M40 44 L20 100 L60 100 Z" fill="#2c3440" stroke="#151a20" stroke-width="2"/>' +
    // 셔츠 브이
    '<path d="M40 46 L32 74 L48 74 Z" fill="#f4f6f8"/>' +
    // 나비넥타이
    '<path d="M40 52 l-8 -5 v10 z M40 52 l8 -5 v10 z" fill="#8a1f2b" stroke="#5c1420" stroke-width="1"/>' +
    '<rect x="38" y="49" width="4" height="6" fill="#5c1420"/>' +
    // 팔
    '<path d="M31 50 L22 78" stroke="#2c3440" stroke-width="8" stroke-linecap="round"/>' +
    '<path d="M49 50 L58 78" stroke="#2c3440" stroke-width="8" stroke-linecap="round"/>' +
    // 얼굴
    '<circle cx="40" cy="30" r="14" fill="#f2c199" stroke="#c2895c" stroke-width="2"/>' +
    // 머리
    '<path d="M25 27 Q28 11 40 11 Q52 11 55 27 Q49 18 40 18 Q31 18 25 27 Z" fill="#2a1e14" stroke="#180f08" stroke-width="1.5"/>' +
    // 눈/미소
    '<circle cx="35" cy="30" r="2.2" fill="#2b2b2b"/>' +
    '<circle cx="45" cy="30" r="2.2" fill="#2b2b2b"/>' +
    '<path d="M36 37 q4 3 8 0" fill="none" stroke="#a05a3a" stroke-width="2" stroke-linecap="round"/>'
  );

  // ===== 트레이너 대체 아트 (오리지널, 실제 게임 스프라이트 아님) =====
  // assets/*.png 가 없을 때만 표시되는 폴백.

  // 남자 트레이너 정면 — 빨간 모자
  var trainerMaleFront = wrap('0 0 80 116',
    '<path d="M40 46 L22 112 L58 112 Z" fill="#3a4a63" stroke="#20293a" stroke-width="2"/>' + // 하의
    '<path d="M40 44 L26 78 L54 78 Z" fill="#c0392b" stroke="#7d241b" stroke-width="2"/>' +   // 상의(빨강)
    '<path d="M30 50 L20 80" stroke="#e6b98f" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M50 50 L60 80" stroke="#e6b98f" stroke-width="6" stroke-linecap="round"/>' +
    '<circle cx="40" cy="30" r="14" fill="#f2c199" stroke="#c2895c" stroke-width="2"/>' +     // 얼굴
    '<path d="M24 28 Q26 12 40 12 Q54 12 56 28 L56 26 Q40 18 24 26 Z" fill="#c0392b" stroke="#7d241b" stroke-width="2"/>' + // 모자
    '<rect x="22" y="26" width="36" height="4" rx="2" fill="#ffffff" stroke="#c9ced6" stroke-width="1"/>' + // 모자챙
    '<circle cx="35" cy="31" r="2.2" fill="#2b2b2b"/>' +
    '<circle cx="45" cy="31" r="2.2" fill="#2b2b2b"/>'
  );

  // 여자 트레이너 정면 — 하얀 모자
  var trainerFemaleFront = wrap('0 0 80 116',
    '<path d="M40 48 L24 84 L56 84 Z" fill="#e05a7a" stroke="#a63a56" stroke-width="2"/>' +   // 치마
    '<path d="M40 108 L34 84 L46 84 Z" fill="#5aa0d0"/>' +                                     // 다리 사이
    '<path d="M40 46 L28 74 L52 74 Z" fill="#4aa3d6" stroke="#2f6d92" stroke-width="2"/>' +   // 상의(파랑)
    '<path d="M30 50 L21 76" stroke="#f3caa8" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M50 50 L59 76" stroke="#f3caa8" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M22 40 Q40 44 58 40 L54 60 Q40 66 26 60 Z" fill="#6b4a34"/>' +                   // 긴 머리
    '<circle cx="40" cy="30" r="14" fill="#f8d2ad" stroke="#d3a377" stroke-width="2"/>' +
    '<ellipse cx="40" cy="20" rx="20" ry="7" fill="#ffffff" stroke="#c9ced6" stroke-width="2"/>' + // 모자챙
    '<path d="M28 20 Q40 4 52 20 Z" fill="#ffffff" stroke="#c9ced6" stroke-width="2"/>' +
    '<circle cx="35" cy="31" r="2.2" fill="#2b2b2b"/>' +
    '<circle cx="45" cy="31" r="2.2" fill="#2b2b2b"/>'
  );

  // 남자 트레이너 뒷모습 — 모자 뒤 + 배낭
  var trainerMaleBack = wrap('0 0 80 116',
    '<path d="M40 48 L22 112 L58 112 Z" fill="#3a4a63" stroke="#20293a" stroke-width="2"/>' +
    '<path d="M40 44 L26 82 L54 82 Z" fill="#c0392b" stroke="#7d241b" stroke-width="2"/>' +
    '<rect x="30" y="52" width="20" height="34" rx="6" fill="#e0b24a" stroke="#a67f2a" stroke-width="2"/>' + // 배낭
    '<path d="M30 50 L21 80" stroke="#e6b98f" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M50 50 L59 80" stroke="#e6b98f" stroke-width="6" stroke-linecap="round"/>' +
    '<circle cx="40" cy="30" r="14" fill="#8a6b4a"/>' +                                        // 뒤통수
    '<path d="M24 30 Q24 12 40 12 Q56 12 56 30 Q40 22 24 30 Z" fill="#c0392b" stroke="#7d241b" stroke-width="2"/>' +
    '<rect x="36" y="24" width="12" height="6" rx="2" fill="#ffffff"/>'                        // 모자 조절부
  );

  // 여자 트레이너 뒷모습 — 모자 뒤 + 배낭 + 포니테일
  var trainerFemaleBack = wrap('0 0 80 116',
    '<path d="M40 48 L24 100 L56 100 Z" fill="#e05a7a" stroke="#a63a56" stroke-width="2"/>' +
    '<path d="M40 44 L28 82 L52 82 Z" fill="#4aa3d6" stroke="#2f6d92" stroke-width="2"/>' +
    '<rect x="31" y="52" width="18" height="30" rx="6" fill="#e0b24a" stroke="#a67f2a" stroke-width="2"/>' +
    '<path d="M30 50 L21 78" stroke="#f3caa8" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M50 50 L59 78" stroke="#f3caa8" stroke-width="6" stroke-linecap="round"/>' +
    '<circle cx="40" cy="30" r="14" fill="#6b4a34"/>' +                                        // 뒤통수(머리)
    '<path d="M40 40 Q52 52 46 74 L36 72 Q42 54 40 40 Z" fill="#6b4a34"/>' +                    // 포니테일
    '<ellipse cx="40" cy="22" rx="18" ry="7" fill="#ffffff" stroke="#c9ced6" stroke-width="2"/>'
  );

  // 파이리(오마주) — 주황 도마뱀 + 꼬리 불꽃 (오리지널, 실제 스프라이트 아님)
  var charmander = wrap('0 0 110 122',
    // 꼬리 + 불꽃
    '<path d="M78 86 Q104 84 100 60" fill="none" stroke="#e07a1e" stroke-width="9" stroke-linecap="round"/>' +
    '<path d="M100 62 q-9 -16 3 -26 q2 12 10 12 q-2 12 -13 14 Z" fill="#ff8a1e" stroke="#e0651a" stroke-width="2"/>' +
    '<path d="M101 58 q-4 -9 2 -15 q1 7 6 7 q-1 7 -8 8 Z" fill="#ffd24a"/>' +
    // 다리
    '<ellipse cx="42" cy="106" rx="11" ry="8" fill="#f2952a" stroke="#c26f16" stroke-width="2"/>' +
    '<ellipse cx="66" cy="106" rx="11" ry="8" fill="#f2952a" stroke="#c26f16" stroke-width="2"/>' +
    // 몸통
    '<ellipse cx="54" cy="74" rx="26" ry="30" fill="#f79a2b" stroke="#c26f16" stroke-width="2.5"/>' +
    // 배(크림)
    '<ellipse cx="54" cy="82" rx="15" ry="18" fill="#ffe0a6"/>' +
    // 팔
    '<path d="M32 70 q-8 4 -8 12" fill="none" stroke="#f79a2b" stroke-width="7" stroke-linecap="round"/>' +
    '<path d="M76 70 q8 4 8 12" fill="none" stroke="#f79a2b" stroke-width="7" stroke-linecap="round"/>' +
    // 머리
    '<circle cx="54" cy="40" r="24" fill="#f79a2b" stroke="#c26f16" stroke-width="2.5"/>' +
    // 눈
    '<ellipse cx="45" cy="37" rx="4.5" ry="6" fill="#fff"/><circle cx="45" cy="38" r="2.6" fill="#1f2933"/>' +
    '<ellipse cx="63" cy="37" rx="4.5" ry="6" fill="#fff"/><circle cx="63" cy="38" r="2.6" fill="#1f2933"/>' +
    // 콧구멍/입
    '<circle cx="50" cy="47" r="1.2" fill="#8a5216"/><circle cx="58" cy="47" r="1.2" fill="#8a5216"/>' +
    '<path d="M47 52 q7 5 14 0" fill="none" stroke="#8a5216" stroke-width="2" stroke-linecap="round"/>'
  );

  window.GAME_SPRITES = {
    oak: oak,
    magikarp: magikarp,
    charmander: charmander,
    bandwang: bandwang,
    bride: bride,
    groom: groom,
    trainerMaleFront: trainerMaleFront,
    trainerFemaleFront: trainerFemaleFront,
    trainerMaleBack: trainerMaleBack,
    trainerFemaleBack: trainerFemaleBack,
  };
})();
