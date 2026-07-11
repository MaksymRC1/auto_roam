"use client";

import { useEffect, useState } from "react";

const IMAGES = [
  "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=2000", // Paris
  "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&q=80&w=2000", // Venice
  "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=2000", // Swiss Alps
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=2000", // Cinque Terre
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=2000", // Greece Santorini
];

export function BackgroundSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
    }, 8000); // Change image every 8 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Task 2.2: Only render current + next image for performance */}
      {IMAGES.map((src, index) => {
        const isVisible = index === currentIndex;
        const isNext = index === (currentIndex + 1) % IMAGES.length;
        if (!isVisible && !isNext) return null;
        return (
          <div
            key={src}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-[2500ms] ease-in-out"
            style={{
              backgroundImage: `url(${src})`,
              opacity: isVisible ? 1 : 0,
            }}
          />
        );
      })}
      {/* Dark overlay to make text/inputs readable */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
    </div>
  );
}
