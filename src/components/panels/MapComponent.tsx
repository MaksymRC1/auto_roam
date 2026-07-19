"use client";

import { useEffect, useRef } from "react";
import { Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useTripStore } from "@/store/useTripStore";

function MapUpdater({ geometry, isCalculated }: { geometry: [number, number][], isCalculated: boolean }) {
  const map = useMap();
  const coreLibrary = useMapsLibrary('core');

  useEffect(() => {
    if (!map || !coreLibrary || !isCalculated || geometry.length === 0) return;
    
    const bounds = new coreLibrary.LatLngBounds();
    geometry.forEach(point => bounds.extend({ lat: point[0], lng: point[1] }));
    map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
  }, [map, coreLibrary, geometry, isCalculated]);

  return null;
}

function PolylineRenderer({ geometry }: { geometry: [number, number][] }) {
  const map = useMap();
  const mapsLibrary = useMapsLibrary('maps');
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !mapsLibrary || geometry.length === 0) return;

    if (!polylineRef.current) {
      polylineRef.current = new mapsLibrary.Polyline({
        map,
        strokeColor: "#2563eb",
        strokeWeight: 5,
        strokeOpacity: 0.8,
        path: geometry.map(p => ({ lat: p[0], lng: p[1] }))
      });
    } else {
      polylineRef.current.setPath(geometry.map(p => ({ lat: p[0], lng: p[1] })));
    }

    return () => {
      // Unmount logic removed to prevent flickering during geometry updates
    };
  }, [map, mapsLibrary, geometry]);

  return null;
}

export default function MapComponent() {
  const { routeGeometry, isCalculated, waypoints } = useTripStore();

  const defaultCenter = { lat: 48.3794, lng: 31.1656 }; // Ukraine center

  return (
    <Map
      defaultCenter={defaultCenter}
      defaultZoom={6}
      disableDefaultUI={true}
      mapId="DEMO_MAP_ID"
      style={{ width: '100%', height: '100%' }}
    >
      <MapUpdater geometry={routeGeometry} isCalculated={isCalculated} />
      {isCalculated && routeGeometry.length > 0 && (
        <PolylineRenderer geometry={routeGeometry} />
      )}

      {isCalculated && waypoints.map((wp) => {
        if (!wp.lat || !wp.lon) return null;
        
        let iconLabel = "📍";
        if (wp.type === 'start') iconLabel = "🟢";
        if (wp.type === 'finish') iconLabel = "🏁";
        if (wp.type === 'stop' && wp.id.startsWith('hotel-')) iconLabel = "🏨";
        if (wp.type === 'border') iconLabel = "🛂";

        return (
          <AdvancedMarker 
            key={wp.id} 
            position={{ lat: wp.lat, lng: wp.lon }}
            title={wp.name}
          >
            <div style={{ fontSize: '24px', textShadow: '0px 2px 4px rgba(0,0,0,0.3)', transform: 'translate(0, -12px)' }}>
              {iconLabel}
            </div>
          </AdvancedMarker>
        );
      })}
    </Map>
  );
}
