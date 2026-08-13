"use client";

import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { useTranslations } from 'next-intl';

export default function MapPickerContent({ 
  selectedPos, 
  onSelect 
}: { 
  selectedPos: [number, number] | null; 
  onSelect: (pos: [number, number]) => void;
}) {
  const initialCenter = { lat: 48.3794, lng: 31.1656 }; // Ukraine center

  return (
    <div className="w-full h-full rounded-md overflow-hidden z-0">
      <Map
        defaultCenter={initialCenter}
        defaultZoom={6}
        disableDefaultUI={true}
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || "DEMO_MAP_ID"}
        style={{ width: "100%", height: "100%" }}
        onClick={(e) => {
          if (e.detail.latLng) {
            onSelect([e.detail.latLng.lat, e.detail.latLng.lng]);
          }
        }}
      >
        {selectedPos && (
          <AdvancedMarker position={{ lat: selectedPos[0], lng: selectedPos[1] }} />
        )}
      </Map>
    </div>
  );
}
