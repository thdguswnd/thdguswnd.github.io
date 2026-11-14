// 페이지 설정. 문구와 동작은 대부분 여기만 고치면 됩니다.
window.APP_CONFIG = {
  // 'mock' = AWS 없이 동작하는 가짜 모드(로컬 테스트용), 'aws' = 실제 업로드
  mode: 'aws',

  // AWS 구성 후 채울 값 (mode: 'aws'일 때만 사용)
  apiBase: 'https://d5hnbad7aufuv.cloudfront.net/api',
  thumbBase: 'https://d5hnbad7aufuv.cloudfront.net/',

  // 캐릭터 위 안내 문구. size: xl(큰 글씨) / m(중간) / s(작은 글씨)
  //   fit: true(기본)면 가운데 칸 폭에 꽉 차게 글자 크기를 자동으로 맞춥니다. false면 작은 고정 크기
  //   \n 을 넣으면 줄을 나눕니다(나눈 줄 중 가장 긴 줄 기준으로 폭에 맞춤)
  //   position: 'top'(기본)이면 캐릭터 위, 'bottom'이면 맨 아래(오시는 길 버튼 밑)
  eventLines: [
    { text: '2026.11.15', size: 'xl' },
    { text: 'AM 11:00', size: 'xl' },
    { text: '로프트가든344\n10층 메인홀', size: 'm' },
    { text: '서울특별시 양천구\n오목로 344 청학빌딩 10층', size: 's', position: 'bottom' },
    { text: 'Tel. 02-2644-7823', size: 's', fit: false, position: 'bottom' },
  ],

  // 캐릭터 이미지. 비워 두면 기본 그림을 씁니다. 예: 'assets/character.gif'
  character: { src: 'assets/character.gif' },
  road: { src: 'assets/road.png' },   // 가운데 배경(길). 필름과 같은 속도로 위로 흐릅니다

  film: {
    speed: 26,        // 필름이 올라가는 속도 (초당 px). 양쪽이 같은 속도로 움직입니다
    minPerSide: 6,    // 사진이 적을 때 한쪽에 최소로 채울 칸 수 (부족하면 기본 이미지)
    maxPerSide: 30,   // 한쪽에 동시에 띄우는 최대 사진 수. 사진이 더 많으면 무작위로 골라 띄웁니다
    rotateSeconds: 60 // 사진이 많을 때 화면 밖 칸 일부를 다른 사진으로 바꾸는 주기
  },

  pollSeconds: 20,    // 새로 올라온 사진을 확인하는 주기
  uploadConcurrency: 4, // 동시에 올리는 파일 수. 거리가 먼 리전일수록 크게 두면 대기 시간이 겹쳐 빨라집니다

  // 업로드 팝업의 전화번호 칸 아래 안내 문구 (번호 입력은 선택)
  phoneNotice: '감사 연락을 드리기 위한 용도로, 예식 후 삭제됩니다.',

  // 업로드 허용 기간 (한국 시간). 실제 차단은 서버(Lambda)가 하고, 여기 값은 화면 안내용입니다
  uploadWindow: { start: '2026-11-14T21:00:00+09:00', end: '2026-11-22T23:59:59+09:00' },

  // 정보 메뉴. position: 'top'은 캐릭터 위, 'bottom'은 캐릭터 아래
  menus: [
    {
      position: 'bottom', label: '오시는 길',  // top = 장소 바로 아래, bottom = 업로드 버튼 아래
      title: '',                               // 비워 두면 팝업에 제목 없이 이미지만 나옵니다
      text: '',                              // 필요하면 안내 문구를 적습니다 (\n 으로 줄바꿈)
      images: ['assets/loftgarden344.webp'], // 위쪽 약도
      // 아래쪽 지도 앱 아이콘 (적은 순서대로 왼쪽부터). 앱이 있으면 앱으로, 없으면 webUrl로 엽니다
      apps: [
        { label: '네이버 지도', icon: 'assets/navermap.webp',
          deepLink: 'nmap://route/car?dlat=37.5237531&dlng=126.8751431&dname=로프트가든344&appname=thdguswnd.github.io',
          webUrl: 'https://naver.me/xyTG8t3T' },
        { label: '카카오내비', icon: 'assets/kakaonavi.webp',
          deepLink: 'kakaonavi://navigate?name=로프트가든344&x=126.8751431&y=37.5237531&coord_type=wgs84',
          webUrl: 'https://map.kakao.com/link/to/로프트가든344,37.5237531,126.8751431' },
        { label: 'T맵', icon: 'assets/tmap.webp',
          deepLink: 'tmap://route?goalname=로프트가든344&goalx=126.8751431&goaly=37.5237531',
          webUrl: 'https://tmap.life/39b6a25c' },
      ],
    },
  ],
};
