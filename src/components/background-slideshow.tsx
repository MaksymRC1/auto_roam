"use client";

import { useEffect, useState, useRef } from "react";

const IMAGES = [
  "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=2000", // Paris
  "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&q=80&w=2000", // Venice
  "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=2000", // Swiss Alps
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=2000", // Cinque Terre
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=2000", // Greece Santorini
];

export function BackgroundSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(IMAGES.length - 1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        setPrevIndex(prev);
        return (prev + 1) % IMAGES.length;
      });
    }, 15000); // 15 seconds delay

    return () => clearInterval(timer);
  }, []);


  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-slate-900" aria-hidden="true">
      <div ref={containerRef} className="absolute inset-0 w-full h-full will-change-transform">
        {IMAGES.map((src, index) => {
          const isActive = index === currentIndex;
          const isPrev = index === prevIndex;
          
          let opacity = 0;
          let zIndex = 0;
          
          if (isActive) {
            opacity = 1;
            zIndex = 2;
          } else if (isPrev) {
            opacity = 1;
            zIndex = 1;
          }

          return (
            <div
              key={src}
              className="absolute -inset-[10%] bg-cover bg-center blur-[6px] transition-opacity duration-[4000ms] ease-in-out"
              style={{
                backgroundImage: `url(${src})`,
                opacity,
                zIndex,
                transform: `scale(1.1)`,
              }}
            />
          );
        })}
      </div>
      <div className="absolute inset-0 bg-black/30 z-10 pointer-events-none" />
    </div>
  );
}
