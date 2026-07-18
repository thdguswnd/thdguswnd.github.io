import { createContext, useContext, ReactNode } from 'react';
import type { InvitationContent } from './types';
import data from './invitation.json';

const content = data as InvitationContent;

const ContentContext = createContext<InvitationContent>(content);

/** 청첩장 콘텐츠(JSON) 제공자. */
export function ContentProvider({ children }: { children: ReactNode }) {
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}

/** 콘텐츠 접근 훅. */
export function useContent(): InvitationContent {
  return useContext(ContentContext);
}
