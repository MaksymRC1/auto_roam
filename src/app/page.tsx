import { TripPlanner } from "@/components/trip-planner"
import { BackgroundSlideshow } from "@/components/background-slideshow"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col font-sans overflow-x-hidden text-slate-200">
      <nav className="fixed top-0 w-full z-50 shadow-xl" style={{ background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
        <div className="flex justify-between items-center h-20 w-full px-4 md:px-8">
          <a className="font-display font-bold text-2xl text-white flex items-center gap-2" href="#">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>route</span>
            AutoRoam
          </a>
          <div className="hidden md:flex items-center gap-6">
            <a className="text-white/80 hover:text-white font-medium transition-colors text-sm" href="#">Статті</a>
            <a className="text-white/80 hover:text-white font-medium transition-colors text-sm" href="#">FAQ</a>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-3 py-1.5 flex items-center gap-2 rounded-full bg-transparent hover:bg-white/10 text-white transition-all border border-white/30 text-xs font-bold shadow-sm group relative">
              <span className="material-symbols-outlined text-[18px] text-white/90 group-hover:animate-heartbeat" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            </button>
            <button className="md:hidden text-white p-2">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="hidden md:flex items-center gap-2 text-white/80 text-sm ml-2">
              <a className="hover:text-white font-bold border-b-2 border-white pb-1" href="#">UA</a>
              <span className="text-white/40">|</span>
              <a className="hover:text-white transition-colors pb-1" href="#">EN</a>
            </div>
          </div>
        </div>
      </nav>

      <BackgroundSlideshow />

      <TripPlanner />

      <footer className="w-full py-8 fixed bottom-0 z-50 text-white" style={{ background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-4 md:px-8 gap-4">
          <div className="font-display text-2xl font-extrabold text-white flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>route</span>
            AutoRoam
          </div>
          <div className="text-sm text-slate-300">
            © 2026 AutoRoam. Всі права захищені.
          </div>
          <div className="flex gap-6 items-center text-base flex-wrap justify-center">
            <a className="text-slate-300 hover:text-white transition-colors" href="#">Контакти</a>
            <button className="px-3 py-1.5 flex items-center gap-2 rounded-full bg-transparent hover:bg-white/10 text-white transition-all border border-white/30 text-xs font-bold shadow-sm group relative">
              <span className="material-symbols-outlined text-[18px] text-white/90 group-hover:animate-heartbeat" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}
