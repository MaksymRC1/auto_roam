"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTripStore } from "@/store/useTripStore";

// Fix Leaflet's default icon path issues with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
});

function MapUpdater({ geometry }: { geometry: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (geometry && geometry.length > 0) {
      const bounds = L.latLngBounds(geometry);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [geometry, map]);
  return null;
}

export default function MapComponent() {
  const { routeGeometry, isCalculated, waypoints } = useTripStore();

  const defaultCenter: [number, number] = [48.3794, 31.1656]; // Ukraine center
  const hasRoute = isCalculated && routeGeometry.length > 0;
  const startPoint = hasRoute ? routeGeometry[0] : defaultCenter;
  const endPoint = hasRoute ? routeGeometry[routeGeometry.length - 1] : null;
  const startName = waypoints.find(w => w.type === 'start')?.name || 'Відправлення';
  const endName = waypoints.find(w => w.type === 'finish')?.name || 'Призначення';

  return (
    <MapContainer 
      center={startPoint} 
      zoom={6} 
      style={{ height: "100%", width: "100%", zIndex: 1 }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {hasRoute && (
        <>
          <MapUpdater geometry={routeGeometry} />
          
          <Polyline 
            positions={routeGeometry} 
            color="#2563eb" 
            weight={5} 
            opacity={0.8} 
            lineCap="round"
            lineJoin="round"
          />
          
          {waypoints.map((wp, i) => {
            if (!wp.lat || !wp.lon) return null;
            
            // Choose color/emoji based on type
            let iconLabel = "📍";
            if (wp.type === 'start') iconLabel = "🟢";
            if (wp.type === 'finish') iconLabel = "🏁";
            if (wp.type === 'stop' && wp.id.startsWith('hotel-')) iconLabel = "🏨";
            if (wp.type === 'border') iconLabel = "🛂";

            // Use DivIcon to render emojis directly on map
            const customIcon = L.divIcon({
              className: 'custom-map-icon',
              html: `<div style="font-size: 24px; text-shadow: 0px 2px 4px rgba(0,0,0,0.3); transform: translate(-12px, -12px);">${iconLabel}</div>`,
            });

            return (
              <Marker key={wp.id} position={[wp.lat, wp.lon]} icon={customIcon}>
                <Popup className="font-semibold text-slate-800">
                  {wp.name}
                </Popup>
              </Marker>
            );
          })}
        </>
      )}
    </MapContainer>
  );
}
