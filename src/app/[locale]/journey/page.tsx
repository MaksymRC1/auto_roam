import dynamic from 'next/dynamic';
import { BackgroundSlideshow } from "@/components/background-slideshow"
import { Loader2 } from "lucide-react";

const JourneyView = dynamic(() => import('@/components/journey-view').then(mod => mod.JourneyView), {
  loading: () => (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
    </div>
  ),
});

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
