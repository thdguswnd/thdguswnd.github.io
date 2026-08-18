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

  // 오박사 — 흰 가운 + 회색 머리
  var oak = wrap('0 0 80 104',
    // 몸통(가운)
    '<path d="M40 48 L14 100 L66 100 Z" fill="#f6f8fa" stroke="#9aa0a6" stroke-width="2"/>' +
    '<line x1="40" y1="48" x2="40" y2="100" stroke="#c7ccd1" stroke-width="2"/>' +
    // 팔
    '<path d="M22 58 L10 84" stroke="#e9edf1" stroke-width="8" stroke-linecap="round"/>' +
    '<path d="M58 58 L70 84" stroke="#e9edf1" stroke-width="8" stroke-linecap="round"/>' +
    // 넥타이 살짝
    '<path d="M40 50 l-4 10 4 6 4-6 z" fill="#c0392b"/>' +
    // 얼굴
    '<circle cx="40" cy="30" r="15" fill="#f3caa0" stroke="#b98a5e" stroke-width="2"/>' +
    // 회색 머리
    '<path d="M24 26 Q40 4 56 26 Q54 14 40 13 Q26 14 24 26 Z" fill="#cfd3d8" stroke="#a7abb0" stroke-width="2"/>' +
    '<path d="M23 27 q-4 6 0 12" fill="none" stroke="#cfd3d8" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M57 27 q4 6 0 12" fill="none" stroke="#cfd3d8" stroke-width="4" stroke-linecap="round"/>' +
    // 눈/눈썹
    '<circle cx="34" cy="30" r="2.4" fill="#2b2b2b"/>' +
    '<circle cx="46" cy="30" r="2.4" fill="#2b2b2b"/>' +
    '<path d="M30 24 h8 M42 24 h8" stroke="#8a8f94" stroke-width="2" stroke-linecap="round"/>'
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

  window.GAME_SPRITES = {
    oak: oak,
    magikarp: magikarp,
    bandwang: bandwang,
    bride: bride,
    groom: groom,
  };
})();
