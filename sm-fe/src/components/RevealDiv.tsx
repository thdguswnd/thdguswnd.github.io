import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/** 뷰포트 진입 시 1회 fade-in 되는 div (항목별 개별 리빌용). */
export function RevealDiv({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
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
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.7s ease',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
