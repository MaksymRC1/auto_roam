"use client";

import dynamic from "next/dynamic";
import { MapIcon } from "lucide-react";

// Dynamically import the Leaflet map to prevent "window is not defined" SSR errors
const LeafletMap = dynamic(() => import("./MapComponent"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 absolute inset-0 z-10">
      <MapIcon className="w-8 h-8 animate-pulse mb-2 text-blue-300" />
      <p className="text-sm font-medium">Завантаження карти...</p>
    </div>
  )
});

export function MapPanel() {
  return (
    <div className="relative w-full h-full flex-1 bg-slate-50">
      <LeafletMap />
    </div>
  );
}
