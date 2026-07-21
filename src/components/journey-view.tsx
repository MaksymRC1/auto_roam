"use client";

import { useEffect, useState } from "react";
import { useTripStore } from "@/store/useTripStore";
import { MapPin, Navigation2, CheckCircle2, Bed, AlertCircle, Clock, Fuel, Printer } from "lucide-react";

const formatTime = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h} год ${m > 0 ? m + ' хв' : ''}`;
};

export function JourneyView() {
  const [mounted, setMounted] = useState(false);
  const { 
    isCalculated, 
    waypoints, 
    completedWaypoints, 
    toggleWaypointCompletion,
    loadFromShareData,
    totalDistance,
    totalDuration,
  } = useTripStore();

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const tripData = params.get('trip');
    if (tripData) {
      loadFromShareData(tripData);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [loadFromShareData]);

  if (!mounted) return null;

  if (!isCalculated) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-12 h-12 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-24 pt-8 px-4 font-sans">
      <div className="bg-[#1a1f2e]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Режим "Мандрівка"</h1>
            <p className="text-white/60 text-sm md:text-base">Ваш стаціонарний таймлайн подорожі.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex gap-3">
              <div className="flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-xl border border-blue-500/30">
                <Navigation2 className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-blue-100">{totalDistance} км</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-500/30">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-emerald-100">{formatTime(totalDuration)}</span>
              </div>
            </div>
            
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 print:hidden"
            >
              <Printer className="w-4 h-4" /> Друк / PDF
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative pl-6 md:pl-10">
          {/* Vertical Line */}
          <div className="absolute left-[41px] md:left-[57px] top-6 bottom-6 w-1 bg-white/10 rounded-full print:bg-slate-300"></div>
          
          <div className="space-y-8">
            {waypoints.map((wp, index) => {
              const isStart = index === 0;
              const isFinish = index === waypoints.length - 1;
              const isFuel = wp.type === 'fuel';
              const isHotel = wp.id.startsWith('hotel-');
              const isBorder = wp.type === 'border';
              const isCompleted = completedWaypoints.includes(wp.id);

              return (
                <div key={wp.id} className="relative flex items-start gap-5 md:gap-8 group print:break-inside-avoid">
                  {/* Icon */}
                  <div className={`relative z-10 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shrink-0 border-4 border-[#1a1f2e] shadow-lg print:border-white ${
                    isStart || isFinish ? 'bg-blue-600' :
                    isFuel ? 'bg-amber-500' :
                    isHotel ? 'bg-indigo-500' :
                    isBorder ? 'bg-red-500' :
                    'bg-slate-600'
                  } ${isCompleted ? 'opacity-50 saturate-50' : ''}`}>
                    {isStart || isFinish ? <MapPin className="w-5 h-5 md:w-6 md:h-6 text-white" /> :
                     isFuel ? <Fuel className="w-5 h-5 md:w-6 md:h-6 text-white" /> :
                     isHotel ? <Bed className="w-5 h-5 md:w-6 md:h-6 text-white" /> :
                     isBorder ? <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-white" /> :
                     <MapPin className="w-5 h-5 md:w-6 md:h-6 text-white" />}
                  </div>

                  {/* Content Card */}
                  <div className={`flex-1 bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 transition-all duration-300 relative print:bg-transparent print:border-slate-300 print:text-black ${
                    isCompleted 
                      ? 'opacity-60 bg-emerald-900/10 border-emerald-900/30' 
                      : 'hover:bg-white/10 hover:border-white/20'
                  }`}>
                    <div className="flex flex-col pr-12 md:pr-16">
                      <span className={`text-lg md:text-xl ${isStart || isFinish ? 'font-bold text-white print:text-black' : 'font-semibold text-white/90 print:text-black'} ${isCompleted ? 'line-through text-white/50 print:text-slate-500' : ''}`}>
                        {wp.name}
                      </span>

                      {/* Progress Checkmark Button (Hidden in Print) */}
                      {!isStart && !isFinish && (
                        <button 
                          onClick={() => toggleWaypointCompletion(wp.id)}
                          className={`absolute top-5 right-5 p-2.5 rounded-xl transition-all duration-200 z-10 flex items-center gap-1 print:hidden ${
                            isCompleted 
                              ? 'text-emerald-400 bg-emerald-900/40 hover:bg-emerald-900/60' 
                              : 'text-white/40 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10'
                          }`}
                          title={isCompleted ? "Відмінити" : "Відмітити як пройдене"}
                        >
                          <CheckCircle2 className="w-6 h-6" />
                          {isCompleted && <span className="text-xs font-bold uppercase hidden md:inline ml-1">Пройдено</span>}
                        </button>
                      )}

                      {!isStart && (
                        <span className="text-sm md:text-base text-white/60 print:text-slate-600 mt-2 flex items-center gap-1.5">
                          <Navigation2 className="w-4 h-4" /> 
                          {wp.distanceFromStart} км від старту • {formatTime(wp.timeFromStart)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
