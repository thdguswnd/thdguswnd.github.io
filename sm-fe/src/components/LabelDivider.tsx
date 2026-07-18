/** 텍스트 양옆에 가로선을 둔 구분 라벨 (———— text ————). */
export function LabelDivider({ text }: { text: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        margin: '0 auto 20px',
        maxWidth: 300,
        color: 'var(--color-accent)',
      }}
    >
      <span style={{ flex: 1, height: 1, background: 'currentColor', opacity: 0.35 }} />
      <span style={{ fontSize: '0.95rem', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>{text}</span>
      <span style={{ flex: 1, height: 1, background: 'currentColor', opacity: 0.35 }} />
    </div>
  );
}
