import { TripPlanner } from "@/components/trip-planner"
import { BackgroundSlideshow } from "@/components/background-slideshow"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col font-sans overflow-x-hidden text-slate-200">
      <Navbar />

      <BackgroundSlideshow />

      <TripPlanner />

      <Footer />
    </main>
  );
}
