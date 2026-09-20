// 청첩장 콘텐츠 스키마 타입 (domain-entities.md 기준)

export interface Person {
  name: string;
  parents: { father?: string; mother?: string };
}

export interface AppLink {
  deepLink: string;
  webUrl: string;
}

export interface Account {
  role?: string;
  holder: string;
  bank: string;
  number: string;
  kakaoPayUrl?: string;
}

export interface TimelineEntry {
  date: string;
  title: string;
  description?: string;
  image?: string;
}

export interface ContactPerson {
  role: string;
  name: string;
  phone: string;
}

export interface InvitationContent {
  main: { title: string; titleSecondary?: string; subtitle?: string };
  greeting: {
    label?: string;
    title?: string;
    poem?: string;
    poemSource?: string;
    // 현재 화면에서는 사용하지 않는다(invitation.json 에서 제거됨). 필수로 두면 tsc 가 실패해 배포가 깨진다.
    message?: string;
    groom: Person;
    bride: Person;
  };
  contacts: { groom: ContactPerson[]; bride: ContactPerson[] };
  timeline: TimelineEntry[];
  calendar: {
    weddingDate: string;
    ceremonyTime?: string;
    holidays?: string[];
    countdown?: { bride: string; groom: string };
  };
  directions: {
    venueName: string;
    address: string;
    mapQuery?: string;
    tel?: string;
    lat?: number;
    lng?: number;
    parking?: string;
    kakaoJsKey?: string;
    appLinks: { naver?: AppLink; kakaoNavi?: AppLink; tmap?: AppLink };
  };
  gift: { message?: string; groomAccounts: Account[]; brideAccounts: Account[] };
}
