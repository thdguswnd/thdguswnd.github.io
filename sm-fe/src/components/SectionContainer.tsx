import { ReactNode } from 'react';
import { ScrollReveal } from './ScrollReveal';

/** 섹션 공통 래퍼: fade-in + 선택적 제목. */
export function SectionContainer({
  id,
  title,
  children,
}: {
  id?: string;
  title?: string;
  children: ReactNode;
}) {
  return (
    <ScrollReveal id={id}>
      {title && <h2 className="section-title">{title}</h2>}
      {children}
    </ScrollReveal>
  );
}
