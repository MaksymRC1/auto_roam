import { decode } from '@googlemaps/polyline-codec';
import { BORDER_SAMPLE_COUNT } from './constants';
import { getCountryName } from './country-names';


export interface GeocodeResult {
  lat: number;
  lon: number;
  countryCode: string;
  name: string;
}

/**
 * Haversine distance between two [lat, lon] points in kilometers.
 */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Build a cumulative distance array along a geometry.
 */
export function buildCumulativeDistances(geometry: [number, number][]): number[] {
  if (geometry.length === 0) return [];
  const cumDist = new Array<number>(geometry.length);
  cumDist[0] = 0;
  for (let i = 1; i < geometry.length; i++) {
    cumDist[i] = cumDist[i - 1] + haversineKm(
      geometry[i - 1][0], geometry[i - 1][1],
      geometry[i][0], geometry[i][1]
    );
  }
  return cumDist;
}

export function geometryIndexToRatio(cumDist: number[], index: number): number {
  const total = cumDist[cumDist.length - 1];
  if (total === 0) return 0;
  return cumDist[Math.min(index, cumDist.length - 1)] / total;
}

export function ratioToGeometryIndex(cumDist: number[], ratio: number): number {
  const targetDist = ratio * cumDist[cumDist.length - 1];
  let lo = 0;
  let hi = cumDist.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cumDist[mid] < targetDist) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export interface RouteLeg {
  distanceKm: number;
  durationMins: number;
}

export interface RouteResult {
  distanceKm: number;
  durationMins: number;
  geometry: [number, number][]; // [lat, lon]
  legs: RouteLeg[];
  bounds?: { sw: [number, number], ne: [number, number] };
}

// 1. Geocoding using Google Maps API
export async function geocodeCity(city: string): Promise<GeocodeResult | null> {
  let query = city.trim();

  // If map picker was used: "Name | lat,lon"
  if (query.includes('|')) {
    const parts = query.split('|');
    const coordsStr = parts[parts.length - 1].trim();
    const coordMatch = coordsStr.match(/^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[2]);
      const name = parts[0].trim();
      const rev = await reverseGeocode(lat, lon);
      return {
         lat, lon,
         name: name !== "Точка на карті" ? name : (rev?.city || name),
         countryCode: rev?.countryCode || 'UNKNOWN'
      };
    }
  }

  try {
    const response = await fetch(`/api/google/geocode?address=${encodeURIComponent(query)}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      const location = result.geometry.location;
      
      // Find country code
      let countryCode = 'UNKNOWN';
      for (const component of result.address_components) {
        if (component.types.includes('country')) {
          countryCode = component.short_name;
          break;
        }
      }

      return {
        lat: location.lat,
        lon: location.lng,
        countryCode,
        name: result.name || result.formatted_address || query
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// 2. Routing using Google Maps Directions API
export async function getRoute(points: GeocodeResult[]): Promise<RouteResult | null> {
  try {
    if (points.length < 2) return null;
    
    const origin = points[0];
    const destination = points[points.length - 1];
    const waypoints = points.slice(1, -1);

    const response = await fetch('/api/google/directions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination, waypoints })
    });
    
    if (!response.ok) return null;

    const data = await response.json();
    if (data.status !== 'OK' || !data.routes || data.routes.length === 0) return null;

    const route = data.routes[0];
    
    // Decode polyline (returns array of [lat, lng])
    const geometry: [number, number][] = decode(route.overview_polyline.points);
    
    let totalDistanceKm = 0;
    let totalDurationMins = 0;
    const legs: RouteLeg[] = route.legs.map((leg: any) => {
      const distanceKm = leg.distance.value / 1000;
      const durationMins = Math.round(leg.duration.value / 60);
      totalDistanceKm += distanceKm;
      totalDurationMins += durationMins;
      return { distanceKm: Math.round(distanceKm), durationMins };
    });

    return {
      distanceKm: Math.round(totalDistanceKm),
      durationMins: Math.round(totalDurationMins),
      geometry,
      legs,
      bounds: {
        sw: [route.bounds.southwest.lat, route.bounds.southwest.lng],
        ne: [route.bounds.northeast.lat, route.bounds.northeast.lng]
      }
    };
  } catch (error) {
    console.error('Routing error:', error);
    return null;
  }
}

interface ReverseGeocodeResult {
  city: string;
  countryCode: string;
}

// 3. Reverse Geocoding using Google Maps API
export async function reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult | null> {
  try {
    const response = await fetch(`/api/google/geocode?latlng=${lat},${lon}`);
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        let city = "Траса";
        let countryCode = "UNKNOWN";
        
        // Find the most specific locality and country
        for (const component of data.results[0].address_components) {
          if (component.types.includes('locality')) city = component.long_name;
          if (component.types.includes('country')) countryCode = component.short_name;
        }
        
        return { city, countryCode };
      }
    }
  } catch (error) {
    console.error('Reverse Geocoding error:', error);
  }
  return null;
}

interface BorderCrossing {
  lat: number;
  lon: number;
  name: string;
  fromCountry: string;
  toCountry: string;
  geometryIndex: number;
}

// 4. Find Borders Algorithm
export async function findBorders(geometry: [number, number][]): Promise<BorderCrossing[]> {
  if (geometry.length < 10) return [];

  const borders: BorderCrossing[] = [];
  const sampleCount = BORDER_SAMPLE_COUNT;
  
  const sampleIndices = [];
  for (let i = 0; i <= sampleCount; i++) {
    sampleIndices.push(Math.floor((i / sampleCount) * (geometry.length - 1)));
  }

  const sampleResults = [];
  for (let i = 0; i < sampleIndices.length; i++) {
    const index = sampleIndices[i];
    const point = geometry[index];
    const geo = await reverseGeocode(point[0], point[1]);
    sampleResults.push({ index, country: geo?.countryCode || 'UNKNOWN' });
  }

  for (let i = 0; i < sampleResults.length - 1; i++) {
    const current = sampleResults[i];
    const next = sampleResults[i+1];
    
    if (current.country !== next.country && current.country !== 'UNKNOWN' && next.country !== 'UNKNOWN') {
      let left = current.index;
      let right = next.index;
      let iters = 0;
      
      while (right - left > 1 && iters < 4) {
        const mid = Math.floor((left + right) / 2);
        const point = geometry[mid];
        
        const geo = await reverseGeocode(point[0], point[1]);
        if (!geo || geo.countryCode === 'UNKNOWN') break;
        
        if (geo.countryCode === current.country) {
          left = mid;
        } else {
          right = mid;
        }
        iters++;
      }
      
      const borderPoint = geometry[right];
      const geo = await reverseGeocode(borderPoint[0], borderPoint[1]);
      
      borders.push({
        lat: borderPoint[0],
        lon: borderPoint[1],
        name: geo?.city || `Кордон ${getCountryName(current.country)} → ${getCountryName(next.country)}`,
        fromCountry: current.country,
        toCountry: next.country,
        geometryIndex: right
      });
    }
  }
  
  return borders;
}
