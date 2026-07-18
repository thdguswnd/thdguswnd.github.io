/** 로딩 placeholder. */
export function Skeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      data-testid="skeleton"
      style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{ aspectRatio: '1 / 1', background: '#e8e2da', borderRadius: 8 }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
