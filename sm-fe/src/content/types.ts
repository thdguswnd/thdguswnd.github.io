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
  main: { heroImage: string; title: string; titleSecondary?: string; subtitle?: string };
  greeting: {
    label?: string;
    title?: string;
    poem?: string;
    poemSource?: string;
    message: string;
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
    tel?: string;
    lat?: number;
    lng?: number;
    parking?: string;
    mapImage?: string;
    kakaoJsKey?: string;
    sketchMapPdf?: string;
    appLinks: { naver?: AppLink; kakaoNavi?: AppLink; tmap?: AppLink };
  };
  gift: { message?: string; groomAccounts: Account[]; brideAccounts: Account[] };
  gallery: { initialCount?: number; images: { src: string; link?: string }[] };
}
