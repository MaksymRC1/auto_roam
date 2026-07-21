import { JourneyView } from "@/components/journey-view"
import { BackgroundSlideshow } from "@/components/background-slideshow"

export default function JourneyPage() {
  return (
    <main className="min-h-screen flex flex-col font-sans overflow-x-hidden text-slate-200">
      <BackgroundSlideshow />
      <div className="relative z-10 p-4 md:p-8 min-h-screen">
        <JourneyView />
      </div>
    </main>
  );
}
