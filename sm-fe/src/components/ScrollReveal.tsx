import { useEffect, useRef, useState, ReactNode } from 'react';

/** 뷰포트 진입 시 1회 fade-in (IntersectionObserver). */
export function ScrollReveal({ children, id }: { children: ReactNode; id?: string }) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target); // 1회만
          }
        });
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id={id} ref={ref} className={`section${visible ? ' is-visible' : ''}`}>
      {children}
    </section>
  );
}
