// 페이지 설정. 문구와 동작은 대부분 여기만 고치면 됩니다.
window.APP_CONFIG = {
  // 'mock' = AWS 없이 동작하는 가짜 모드(로컬 테스트용), 'aws' = 실제 업로드
  mode: 'aws',

  // AWS 구성 후 채울 값 (mode: 'aws'일 때만 사용)
  apiBase: 'https://d5hnbad7aufuv.cloudfront.net/api',
  thumbBase: 'https://d5hnbad7aufuv.cloudfront.net/',

  title: '사진 남기기',
  subtitle: '오늘의 순간을 함께 모아 주세요',

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
  phoneNotice: '상품 증정 연락용으로만 쓰며, 12월 6일 자동 삭제됩니다.',

  // 업로드 허용 기간 (한국 시간). 실제 차단은 서버(Lambda)가 하고, 여기 값은 화면 안내용입니다
  uploadWindow: { start: '2026-11-14T21:00:00+09:00', end: '2026-11-22T23:59:59+09:00' },

  // 정보 메뉴. position: 'top'은 캐릭터 위, 'bottom'은 캐릭터 아래
  menus: [
    {
      position: 'top', label: '안내',
      title: '안내',
      text: '이 페이지에서 오늘 찍은 사진과 영상을 올려 주세요.\n올린 사진은 화면 양옆 필름에 함께 표시됩니다.',
      images: [],
    },
    {
      position: 'top', label: '일정',
      title: '일정',
      text: '11월 15일 (토)\n여기에 시간별 일정을 적습니다.',
      images: [],
    },
    {
      position: 'bottom', label: '오시는 길',
      title: '오시는 길',
      text: '여기에 장소와 교통편을 적습니다.\n이미지는 images에 경로를 넣으면 아래에 표시됩니다.',
      images: [],   // 예: ['assets/map.jpg']
    },
  ],
};
