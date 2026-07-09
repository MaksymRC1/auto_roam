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
          
          <Marker position={startPoint}>
            <Popup className="font-semibold text-slate-800">
              Старт: {startName}
            </Popup>
          </Marker>
          
          {endPoint && (
            <Marker position={endPoint}>
              <Popup className="font-semibold text-slate-800">
                Фініш: {endName}
              </Popup>
            </Marker>
          )}
        </>
      )}
    </MapContainer>
  );
}
