import { lazy, Suspense } from 'react';
import { ContentProvider } from './content/ContentProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Skeleton } from './components/Skeleton';
import { HeroSection } from './sections/HeroSection';
import { GreetingSection } from './sections/GreetingSection';
import { ContactSection } from './sections/ContactSection';
import { TimelineSection } from './sections/TimelineSection';
import { CalendarSection } from './sections/CalendarSection';
import { DirectionsSection } from './sections/DirectionsSection';
import { RsvpSection } from './sections/RsvpSection';
import { GiftSection } from './sections/GiftSection';

// 하단 무거운 섹션은 지연 로드 (코드 스플리팅)
const GallerySection = lazy(() =>
  import('./sections/GallerySection').then((m) => ({ default: m.GallerySection })),
);

export default function App() {
  return (
    <ErrorBoundary>
      <ContentProvider>
        <HeroSection />
        <GreetingSection />
        <ContactSection />
        <TimelineSection />
        <CalendarSection />
        <DirectionsSection />
        <RsvpSection />
        <Suspense fallback={<Skeleton />}>
          <GallerySection />
        </Suspense>
        <GiftSection />
      </ContentProvider>
    </ErrorBoundary>
  );
}
