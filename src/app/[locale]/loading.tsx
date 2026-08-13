import { MapPin, Navigation } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Loading() {
  const t = useTranslations('Global');
  return (
    <div className="fixed inset-0 z-[10000] bg-slate-950 flex flex-col items-center justify-center">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Pulsing rings */}
        <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
        <div className="absolute inset-2 rounded-full border border-blue-400/20 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
        
        {/* Spinning dashed orbit */}
        <div className="absolute inset-4 rounded-full border-2 border-dashed border-white/20 animate-[spin_4s_linear_infinite]"></div>
        
        {/* Orbiting Navigation Icon */}
        <div className="absolute inset-4 animate-[spin_2s_linear_infinite]">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-950 rounded-full p-1 text-blue-500">
            <Navigation className="w-5 h-5 rotate-90" />
          </div>
        </div>
        
        {/* Center Map Pin */}
        <div className="absolute">
          <MapPin className="w-8 h-8 text-white/80 animate-bounce" />
        </div>
      </div>
      
      <h2 className="mt-8 text-xl font-semibold text-white tracking-widest uppercase">
        Auto<span className="text-blue-500">Roam</span>
      </h2>
      <p className="mt-2 text-white/50 text-sm animate-pulse">
        {t('loading')}
      </p>
    </div>
  );
}
