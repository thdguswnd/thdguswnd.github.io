import { useContent } from '../content/ContentProvider';
import { SectionContainer } from '../components/SectionContainer';
import { SmartImage } from '../components/SmartImage';
import { RevealDiv } from '../components/RevealDiv';
import type { TimelineEntry } from '../content/types';

/** FR-06: 타임라인. 이미지 + 텍스트가 좌우로 번갈아 배치되는 세로 타임라인. */
export function TimelineSection() {
  const { timeline } = useContent();

  return (
    <SectionContainer id="timeline" title="그리고 지금까지.">
      <div style={{ position: 'relative' }} data-testid="timeline">
        {/* 가운데 세로선 */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: 1,
            background: '#d8d0c8',
            transform: 'translateX(-50%)',
          }}
        />
        {timeline.map((entry, i) => (
          <RevealDiv key={i}>
            <TimelineRow entry={entry} imageRight={i % 2 === 0} />
          </RevealDiv>
        ))}
      </div>
    </SectionContainer>
  );
}

function TimelineRow({ entry, imageRight }: { entry: TimelineEntry; imageRight: boolean }) {
  const image = (
    <div style={{ flex: 1, minWidth: 0 }}>
      {entry.image && (
        <SmartImage
          src={entry.image}
          alt={entry.title}
          loading="lazy"
          style={{ width: '100%', borderRadius: 12, objectFit: 'cover', display: 'block' }}
        />
      )}
    </div>
  );

  const text = (
    <div style={{ flex: 1, minWidth: 0, textAlign: 'center', padding: '0 10px' }}>
      <div style={{ color: 'var(--color-muted)', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
        {entry.date}
      </div>
      <div style={{ fontWeight: 600, margin: '6px 0' }}>{entry.title}</div>
      {entry.description && (
        <p style={{ fontSize: '0.82rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
          {entry.description}
        </p>
      )}
    </div>
  );

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        margin: '32px 0',
      }}
    >
      {/* 가운데 점 */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 9,
          height: 9,
          borderRadius: '50%',
          background: 'var(--color-accent)',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
        }}
      />
      {imageRight ? (
        <>
          {text}
          {image}
        </>
      ) : (
        <>
          {image}
          {text}
        </>
      )}
    </div>
  );
}
