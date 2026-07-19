"use client";

import dynamic from "next/dynamic";
import { MapIcon } from "lucide-react";
import { APIProvider } from '@vis.gl/react-google-maps';

const GoogleMapComponent = dynamic(() => import("./MapComponent"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-white/50 bg-black/20 backdrop-blur-sm absolute inset-0 z-10">
      <MapIcon className="w-8 h-8 animate-pulse mb-2 text-blue-300" />
      <p className="text-sm font-medium">Завантаження карти...</p>
    </div>
  )
});

export function MapPanel() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  return (
    <div className="relative w-full h-full flex-1 bg-transparent">
      <APIProvider apiKey={apiKey} libraries={['places', 'geometry']}>
        <GoogleMapComponent />
      </APIProvider>
    </div>
  );
}
