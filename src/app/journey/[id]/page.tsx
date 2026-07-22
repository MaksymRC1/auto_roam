import { getJourney } from "@/lib/db";
import { notFound } from "next/navigation";
import { JourneyView } from "@/components/journey-view";
import { BackgroundSlideshow } from "@/components/background-slideshow";

export default async function SharedJourneyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const journey = await getJourney(id);

  if (!journey) {
    notFound();
  }

  return (
    <main className="min-h-screen flex flex-col font-sans overflow-x-hidden text-slate-200">
      <BackgroundSlideshow />
      <div className="relative z-10 p-4 md:p-8 min-h-screen">
        <JourneyView initialJourneyData={journey.route_data} />
      </div>
    </main>
  );
}
