import { TripPlanner } from "@/components/trip-planner"

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* Mobile-friendly header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-600 tracking-tight">AutoRoam</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="cursor-pointer" title="Змінити мову">🇺🇦</span>
            <span className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-300 transition-colors">👤</span>
          </div>
        </div>
      </header>
      
      {/* Main content area containing the planner */}
      <TripPlanner />
    </main>
  );
}
