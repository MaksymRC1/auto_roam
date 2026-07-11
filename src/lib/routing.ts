export interface GeocodeResult {
  lat: number;
  lon: number;
  countryCode: string;
  name: string;
}

/**
 * Haversine distance between two [lat, lon] points in kilometers.
 */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
 * cumDist[0] = 0, cumDist[i] = total km from geometry[0] to geometry[i].
 */
export function buildCumulativeDistances(geometry: [number, number][]): number[] {
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

/**
 * Given a cumulative distances array and a geometry index, return the
 * proportion of the route completed (0..1), properly distance-weighted.
 */
export function geometryIndexToRatio(cumDist: number[], index: number): number {
  const total = cumDist[cumDist.length - 1];
  if (total === 0) return 0;
  return cumDist[Math.min(index, cumDist.length - 1)] / total;
}

/**
 * Given a cumulative distances array and a target ratio (0..1), find the
 * geometry index closest to that distance proportion.
 */
export function ratioToGeometryIndex(cumDist: number[], ratio: number): number {
  const targetDist = ratio * cumDist[cumDist.length - 1];
  // Binary search for the closest index
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
  geometry: [number, number][]; // [lat, lon] for Leaflet
  legs: RouteLeg[];
}

// 1. Geocoding using Open-Meteo with Photon fallback
export async function geocodeCity(city: string): Promise<GeocodeResult | null> {
  let query = city.trim();
  let isPoi = false;

  // Smart URL parsing
  try {
    if (query.startsWith('http')) {
      const parsedUrl = new URL(query);
      
      // 1. Booking.com
      if (parsedUrl.hostname.includes('booking.com')) {
        const match = parsedUrl.pathname.match(/\/hotel\/[a-z]+\/([^.]+)/);
        if (match && match[1]) {
          query = match[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          isPoi = true; // Skip city geocoder for hotels
        }
      }
      
      // 2. Google Maps
      if (parsedUrl.hostname.includes('google.com') || parsedUrl.hostname.includes('maps.app.goo.gl') || parsedUrl.hostname.includes('goo.gl')) {
        let finalUrl = query;
        if (parsedUrl.hostname.includes('maps.app.goo.gl') || parsedUrl.hostname.includes('goo.gl')) {
           const res = await fetch(`/api/resolve-url?url=${encodeURIComponent(query)}`);
           if (res.ok) {
              const data = await res.json();
              if (data.success && data.url) finalUrl = data.url;
           }
        }
        const match = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (match) {
          const lat = parseFloat(match[1]);
          const lon = parseFloat(match[2]);
          const rev = await reverseGeocode(lat, lon);
          return {
             lat, lon,
             name: rev?.city || "Місце з карти",
             countryCode: rev?.countryCode || 'UNKNOWN'
          };
        }
      }
      
      // 3. Waze
      if (parsedUrl.hostname.includes('waze.com')) {
        const ll = parsedUrl.searchParams.get('ll');
        if (ll) {
          const [latStr, lonStr] = ll.split(',');
          if (latStr && lonStr) {
            const lat = parseFloat(latStr);
            const lon = parseFloat(lonStr);
            const rev = await reverseGeocode(lat, lon);
            return {
               lat, lon,
               name: rev?.city || "Місце з Waze",
               countryCode: rev?.countryCode || 'UNKNOWN'
            };
          }
        }
      }
    }
  } catch (e) {
    console.error("URL parsing failed", e);
  }

  // 4. Exact coordinates from MapPickerModal (Format: "Name | lat,lon")
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
    // Primary: Open-Meteo (excellent for major cities)
    if (!isPoi) {
      const omUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=uk&format=json`;
      const omRes = await fetch(omUrl);
      if (omRes.ok) {
        const omData = await omRes.json();
        if (omData.results && omData.results.length > 0) {
          const result = omData.results[0];
          return {
            lat: result.latitude,
            lon: result.longitude,
            countryCode: result.country_code?.toUpperCase() || 'UNKNOWN',
            name: result.name || query
          };
        }
      }
    }

    // Fallback: Photon (better for small towns, POIs, hotels)
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`;
    const photonRes = await fetch(photonUrl);
    if (photonRes.ok) {
      const photonData = await photonRes.json();
      if (photonData.features && photonData.features.length > 0) {
        const result = photonData.features[0];
        const props = result.properties;
        const coords = result.geometry.coordinates; // [lon, lat]
        return {
          lat: coords[1],
          lon: coords[0],
          countryCode: props.countrycode?.toUpperCase() || 'UNKNOWN',
          name: props.name || props.city || query
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}



// 2. Routing using OSRM
export async function getRoute(points: GeocodeResult[]): Promise<RouteResult | null> {
  try {
    if (points.length < 2) return null;
    
    // OSRM format: lon1,lat1;lon2,lat2;...
    const coords = points.map(p => `${p.lon},${p.lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
    
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) return null;

    const route = data.routes[0];
    
    // Convert GeoJSON [lon, lat] to Leaflet format [lat, lon]
    const geometry: [number, number][] = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
    
    const legs: RouteLeg[] = (route.legs || []).map((leg: any) => ({
      distanceKm: Math.round(leg.distance / 1000),
      durationMins: Math.round(leg.duration / 60)
    }));

    return {
      distanceKm: Math.round(route.distance / 1000),
      durationMins: Math.round(route.duration / 60),
      geometry,
      legs
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

// 3. Fast Reverse Geocoding using BigDataCloud with Nominatim fallback
export async function reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult | null> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=uk`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('BDC failed');
    
    const data = await response.json();
    if (!data.countryCode) throw new Error('BDC missing data');
    
    return {
      city: data.city || data.locality || data.principalSubdivision || data.countryName || "Траса",
      countryCode: data.countryCode?.toUpperCase() || "UNKNOWN"
    };
  } catch (error) {
    console.warn('BigDataCloud failed, falling back to Photon:', error);
    try {
       const photonUrl = `https://photon.komoot.io/reverse?lon=${lon}&lat=${lat}`;
       const photonRes = await fetch(photonUrl);
       if (photonRes.ok) {
          const photonData = await photonRes.json();
          if (photonData.features && photonData.features.length > 0) {
             const props = photonData.features[0].properties;
             return {
                city: props.city || props.name || props.town || props.village || props.state || "Траса",
                countryCode: props.countrycode?.toUpperCase() || "UNKNOWN"
             };
          }
       }
    } catch (photonError) {
       console.error('Photon fallback also failed:', photonError);
    }
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

// 4. Find Borders Algorithm (Optimized for safe batch execution to avoid rate limits)
export async function findBorders(geometry: [number, number][]): Promise<BorderCrossing[]> {
  if (geometry.length < 10) return [];

  const borders: BorderCrossing[] = [];
  const sampleCount = 10;
  
  // 1. Take equidistant samples
  const sampleIndices = [];
  for (let i = 0; i <= sampleCount; i++) {
    sampleIndices.push(Math.floor((i / sampleCount) * (geometry.length - 1)));
  }

  // Execute sequentially to avoid BigDataCloud / Photon rate limits
  const sampleResults = [];
  for (let i = 0; i < sampleIndices.length; i++) {
    const index = sampleIndices[i];
    const point = geometry[index];
    const geo = await reverseGeocode(point[0], point[1]);
    sampleResults.push({ index, country: geo?.countryCode || 'UNKNOWN' });
    
    // Add a delay to protect API
    if (i < sampleIndices.length - 1) {
      await new Promise(r => setTimeout(r, 400));
    }
  }

  // 2. Find transitions and perform binary search
  for (let i = 0; i < sampleResults.length - 1; i++) {
    const current = sampleResults[i];
    const next = sampleResults[i+1];
    
    // Ignore UNKNOWN borders
    if (current.country !== next.country && current.country !== 'UNKNOWN' && next.country !== 'UNKNOWN') {
      
      let left = current.index;
      let right = next.index;
      let iters = 0;
      
      // Binary search between left and right index, max 4 iterations
      while (right - left > 1 && iters < 4) {
        const mid = Math.floor((left + right) / 2);
        const point = geometry[mid];
        
        // Delay to protect API during binary search
        await new Promise(r => setTimeout(r, 400));
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
