"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";

export function GlobePlaceholder() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);

  useEffect(() => {
    let phi = 0;
    
    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 800,
      height: 800,
      phi: 0,
      theta: 0.3, // Tilt slightly towards north
      dark: 0, // Light mode
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 2,
      baseColor: [0.9, 0.95, 1], // Light blue ocean
      markerColor: [0.1, 0.6, 1], // Deeper blue marker
      glowColor: [1, 1, 1], // White atmosphere glow
      markers: [
        // Add a few European markers just for flavor
        { location: [50.4501, 30.5234], size: 0.05 }, // Kyiv
        { location: [48.8566, 2.3522], size: 0.05 }, // Paris
        { location: [41.9028, 12.4964], size: 0.05 }, // Rome
        { location: [52.5200, 13.4050], size: 0.05 }, // Berlin
        { location: [40.4168, -3.7038], size: 0.05 }, // Madrid
      ],
      onRender: (state) => {
        // Called on every animation frame.
        if (!pointerInteracting.current) {
          phi += 0.003; // Slow rotation
        }
        state.phi = phi + pointerInteractionMovement.current;
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center overflow-hidden bg-slate-50/50">
      <div className="absolute inset-0 w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          onPointerDown={(e) => {
            pointerInteracting.current = e.clientX;
            canvasRef.current!.style.cursor = 'grabbing';
          }}
          onPointerUp={() => {
            pointerInteracting.current = null;
            canvasRef.current!.style.cursor = 'grab';
          }}
          onPointerOut={() => {
            pointerInteracting.current = null;
            canvasRef.current!.style.cursor = 'grab';
          }}
          onPointerMove={(e) => {
            if (pointerInteracting.current !== null) {
              const delta = e.clientX - pointerInteracting.current;
              pointerInteractionMovement.current = delta * 0.01;
            }
          }}
          style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
        />
      </div>
      <div className="relative z-20 flex flex-col items-center text-center p-8 bg-white/70 backdrop-blur-md rounded-2xl border border-white shadow-xl max-w-sm mx-4 pointer-events-none">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Світ чекає!</h3>
        <p className="text-slate-600 font-medium leading-relaxed">Введіть початкову та кінцеву точки праворуч, щоб побудувати маршрут вашої мрії.</p>
      </div>
    </div>
  );
}
