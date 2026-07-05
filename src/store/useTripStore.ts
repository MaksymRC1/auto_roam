import { create } from 'zustand';
import { geocodeCity, getRoute, findBorders, reverseGeocode } from '@/lib/routing';

export type WaypointType = 'start' | 'finish' | 'stop' | 'border' | 'fuel';

export interface Waypoint {
  id: string;
  name: string;
  type: WaypointType;
  distanceFromStart: number;
  timeFromStart: number;
}

export type PanelType = 'map' | 'fuel' | 'hotel' | 'borders' | 'budget';

interface TripState {
  from: string;
  to: string;
  isCalculated: boolean;
  isLoading: boolean;
  error: string | null;
  totalDistance: number; // km
  totalDuration: number; // min
  waypoints: Waypoint[];
  routeGeometry: [number, number][]; // Array of [lat, lon]
  crossedCountries: string[]; // ISO Country codes e.g. UA, PL
  activePanel: PanelType;
  
  calculateRoute: (from: string, to: string) => Promise<void>;
  setActivePanel: (panel: PanelType) => void;
  resetTrip: () => void;
}

export const useTripStore = create<TripState>((set) => ({
  from: '',
  to: '',
  isCalculated: false,
  isLoading: false,
  error: null,
  totalDistance: 0,
  totalDuration: 0,
  waypoints: [],
  routeGeometry: [],
  crossedCountries: [],
  activePanel: 'fuel',

  calculateRoute: async (from, to) => {
    set({ isLoading: true, error: null, isCalculated: false });

    try {
      // 1. Geocode cities
      const start = await geocodeCity(from);
      const finish = await geocodeCity(to);

      if (!start || !finish) {
        set({ isLoading: false, error: 'Не вдалося знайти одне з міст. Перевірте назви.' });
        return;
      }

      // 2. Get Route
      const route = await getRoute(start, finish);

      if (!route) {
        set({ isLoading: false, error: 'Не вдалося прокласти маршрут між цими містами.' });
        return;
      }

      // 3. Generate Waypoints dynamically
      const waypoints: Waypoint[] = [];
      const countries = new Set<string>();
      
      waypoints.push({ id: 'start', name: start.name, type: 'start', distanceFromStart: 0, timeFromStart: 0 });
      countries.add(start.countryCode);
      countries.add(finish.countryCode);

      // Check for exact borders via Binary Search
      if (start.countryCode !== finish.countryCode) {
        const borders = await findBorders(route.geometry);
        for (const border of borders) {
          countries.add(border.toCountry);
          // Estimate distance/time based on geometry index
          const ratio = border.geometryIndex / route.geometry.length;
          waypoints.push({
            id: `border-${border.geometryIndex}`,
            name: `Кордон ${border.fromCountry} → ${border.toCountry} (поруч з ${border.name})`,
            type: 'border',
            distanceFromStart: Math.round(route.distanceKm * ratio),
            timeFromStart: Math.round(route.durationMins * ratio)
          });
        }
      }

      // Recommend hotel stop every 8 hours (480 mins)
      if (route.durationMins > 480) {
        const stopsCount = Math.floor(route.durationMins / 480);
        for (let i = 1; i <= stopsCount; i++) {
          const ratio = (480 * i) / route.durationMins;
          const geomIndex = Math.floor(route.geometry.length * ratio);
          const point = route.geometry[geomIndex];
          
          // Get REAL city name for the hotel stop
          const geo = await reverseGeocode(point[0], point[1]);
          const cityName = geo && geo.city !== "Невідома локація" ? geo.city : 'Невідомо';
          
          waypoints.push({
            id: `hotel-${i}`,
            name: `Ночівля у м. ${cityName}`,
            type: 'stop',
            distanceFromStart: Math.round(route.distanceKm * ratio),
            timeFromStart: 480 * i
          });
        }
      }

      waypoints.push({
        id: 'finish',
        name: finish.name,
        type: 'finish',
        distanceFromStart: route.distanceKm,
        timeFromStart: route.durationMins
      });

      // Sort waypoints strictly by distance to ensure correct timeline flow
      waypoints.sort((a, b) => a.distanceFromStart - b.distanceFromStart);

      set({
        from: start.name,
        to: finish.name,
        isCalculated: true,
        isLoading: false,
        error: null,
        totalDistance: route.distanceKm,
        totalDuration: route.durationMins,
        routeGeometry: route.geometry,
        crossedCountries: Array.from(countries),
        waypoints,
        activePanel: 'fuel'
      });
    } catch (err) {
      console.error(err);
      set({ isLoading: false, error: 'Сталася помилка при розрахунку маршруту.' });
    }
  },

  setActivePanel: (panel) => set({ activePanel: panel }),
  
  resetTrip: () => set({ 
    from: '', 
    to: '', 
    isCalculated: false, 
    error: null,
    totalDistance: 0, 
    totalDuration: 0, 
    waypoints: [],
    routeGeometry: [],
    crossedCountries: [],
    activePanel: 'fuel' 
  }),
}));
