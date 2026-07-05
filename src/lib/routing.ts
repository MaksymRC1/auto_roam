export interface GeocodeResult {
  lat: number;
  lon: number;
  countryCode: string;
  name: string;
}

export interface RouteResult {
  distanceKm: number;
  durationMins: number;
  geometry: [number, number][]; // [lat, lon] for Leaflet
}

// 1. Geocoding using Nominatim
export async function geocodeCity(city: string): Promise<GeocodeResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AutoRoam/1.0 (MVP Prototype)' // Nominatim requires a valid user agent
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data || data.length === 0) return null;

    const result = data[0];
    return {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      countryCode: result.address?.country_code?.toUpperCase() || 'UNKNOWN',
      name: result.name || city
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// 2. Routing using OSRM
export async function getRoute(start: GeocodeResult, end: GeocodeResult): Promise<RouteResult | null> {
  try {
    // OSRM format: lon,lat
    const coords = `${start.lon},${start.lat};${end.lon},${end.lat}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
    
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) return null;

    const route = data.routes[0];
    
    // Convert GeoJSON [lon, lat] to Leaflet format [lat, lon]
    const geometry: [number, number][] = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);

    return {
      distanceKm: Math.round(route.distance / 1000),
      durationMins: Math.round(route.duration / 60),
      geometry
    };
  } catch (error) {
    console.error('Routing error:', error);
    return null;
  }
}

export interface ReverseGeocodeResult {
  city: string;
  countryCode: string;
}

// 3. Fast Reverse Geocoding using BigDataCloud
export async function reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult | null> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=uk`;
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    return {
      city: data.city || data.locality || data.principalSubdivision || "Невідома локація",
      countryCode: data.countryCode?.toUpperCase() || "UNKNOWN"
    };
  } catch (error) {
    console.error('Reverse Geocoding error:', error);
    return null;
  }
}

export interface BorderCrossing {
  lat: number;
  lon: number;
  name: string;
  fromCountry: string;
  toCountry: string;
  geometryIndex: number;
}

// 4. Find Borders Algorithm (Binary Search on Route Geometry)
export async function findBorders(geometry: [number, number][]): Promise<BorderCrossing[]> {
  if (geometry.length < 10) return [];

  const borders: BorderCrossing[] = [];
  const sampleCount = 10;
  
  // 1. Take 10 equidistant samples in parallel to find rough country transitions
  const promises = [];
  for (let i = 0; i <= sampleCount; i++) {
    const index = Math.floor((i / sampleCount) * (geometry.length - 1));
    const point = geometry[index];
    promises.push(
      reverseGeocode(point[0], point[1]).then(geo => ({ 
        index, 
        country: geo?.countryCode || 'UNKNOWN' 
      }))
    );
  }
  
  const samples = await Promise.all(promises);

  // 2. Find transitions and binary search exact border
  for (let i = 0; i < samples.length - 1; i++) {
    const current = samples[i];
    const next = samples[i+1];
    
    if (current.country !== next.country && current.country !== 'UNKNOWN' && next.country !== 'UNKNOWN') {
      let left = current.index;
      let right = next.index;
      let iters = 0;
      
      // Binary search between left and right index
      while (right - left > 1 && iters < 6) {
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
      
      // 'right' is the first point in the new country
      const borderPoint = geometry[right];
      const geo = await reverseGeocode(borderPoint[0], borderPoint[1]);
      
      borders.push({
        lat: borderPoint[0],
        lon: borderPoint[1],
        name: geo?.city || `Кордон ${current.country} → ${next.country}`,
        fromCountry: current.country,
        toCountry: next.country,
        geometryIndex: right
      });
    }
  }
  
  return borders;
}
