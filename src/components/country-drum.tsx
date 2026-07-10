"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

const COUNTRIES = [
  "Італія 🇮🇹",
  "Іспанія 🇪🇸",
  "Франція 🇫🇷",
  "Греція 🇬🇷",
  "Хорватія 🇭🇷",
  "Португалія 🇵🇹",
  "Чорногорія 🇲🇪",
  "Австрія 🇦🇹",
  "Швейцарія 🇨🇭",
  "Нідерланди 🇳🇱",
  "Німеччина 🇩🇪",
  "Чехія 🇨🇿",
  "Польща 🇵🇱",
  "Словаччина 🇸🇰",
  "Словенія 🇸🇮",
  "Болгарія 🇧🇬",
  "Румунія 🇷🇴",
  "Швеція 🇸🇪",
  "Норвегія 🇳🇴",
  "Данія 🇩🇰",
];

// Duplicate for infinite scrolling effect visually
const DRUM_ITEMS = [...COUNTRIES, ...COUNTRIES, ...COUNTRIES];

export function CountryDrumPlaceholder() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  // Auto-scroll logic
  useEffect(() => {
    if (!scrollRef.current || isInteracting) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({ top: 1, behavior: "auto" });
        
        // Reset scroll position if we reached the bottom third
        if (scrollRef.current.scrollTop > (scrollRef.current.scrollHeight * 2) / 3) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight / 3;
        }
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isInteracting]);

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center overflow-hidden bg-slate-50/50">
      
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-200 via-transparent to-transparent"></div>

      {/* The Drum */}
      <div 
        className="relative h-64 w-full max-w-sm mx-auto overflow-hidden rounded-3xl"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)'
        }}
      >
        <div 
          ref={scrollRef}
          className="h-full w-full overflow-y-auto hide-scrollbar snap-y snap-mandatory cursor-grab active:cursor-grabbing"
          onMouseEnter={() => setIsInteracting(true)}
          onMouseLeave={() => setIsInteracting(false)}
          onTouchStart={() => setIsInteracting(true)}
          onTouchEnd={() => setIsInteracting(false)}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Spacer for first item centering */}
          <div className="h-[calc(50%-2rem)]"></div>
          
          {DRUM_ITEMS.map((country, idx) => (
            <div 
              key={idx} 
              className="h-16 flex items-center justify-center text-3xl font-bold text-slate-800 snap-center hover:scale-110 transition-transform select-none"
            >
              {country}
            </div>
          ))}

          {/* Spacer for last item centering */}
          <div className="h-[calc(50%-2rem)]"></div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}
