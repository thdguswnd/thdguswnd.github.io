import { ContentProvider } from './content/ContentProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HeroSection } from './sections/HeroSection';
import { GreetingSection } from './sections/GreetingSection';
import { TimelineSection } from './sections/TimelineSection';
import { CalendarSection } from './sections/CalendarSection';
import { DirectionsSection } from './sections/DirectionsSection';
import { RsvpSection } from './sections/RsvpSection';
import { GallerySection } from './sections/GallerySection';
import { GiftSection } from './sections/GiftSection';

export default function App() {
  return (
    <ErrorBoundary>
      <ContentProvider>
        <HeroSection />
        <GreetingSection />
        <TimelineSection />
        <CalendarSection />
        <DirectionsSection />
        <RsvpSection />
        <GallerySection />
        <GiftSection />
      </ContentProvider>
    </ErrorBoundary>
  );
}
