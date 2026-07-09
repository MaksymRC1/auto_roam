import { create } from 'zustand';
import { geocodeCity, getRoute, findBorders, reverseGeocode, GeocodeResult } from '@/lib/routing';

export type WaypointType = 'start' | 'finish' | 'stop' | 'border' | 'fuel';

export type FuelType = 'gasoline' | 'diesel' | 'lpg';

export interface FuelPricesData {
  gasoline: number;
  diesel: number;
  lpg: number;
}

export interface Waypoint {
  id: string;
  name: string;
  type: WaypointType;
  distanceFromStart: number;
  timeFromStart: number;
  lat?: number;
  lon?: number;
}

export type PanelType = 'map' | 'fuel' | 'hotel' | 'borders' | 'budget';

export interface StopInput {
  id: string;
  value: string;
}

interface TripState {
  stops: StopInput[];
  isCalculated: boolean;
  isLoading: boolean;
  error: string | null;
  totalDistance: number; // km
  totalDuration: number; // min
  waypoints: Waypoint[];
  routeGeometry: [number, number][]; // Array of [lat, lon]
  crossedCountries: string[]; // ISO Country codes e.g. UA, PL
  activePanel: PanelType | null;
  
  fuelPrices: Record<string, FuelPricesData>;
  selectedFuelType: FuelType;
  
  consumption: string;
  fuelAmounts: Record<string, string>;
  currency: string;
  exchangeRates: Record<string, number>;
  
  setStops: (stops: StopInput[]) => void;
  addStop: () => void;
  removeStop: (id: string) => void;
  updateStop: (id: string, value: string) => void;
  calculateRoute: () => Promise<void>;
  setActivePanel: (panel: PanelType | null) => void;
  setFuelType: (type: FuelType) => void;
  fetchFuelPrices: () => Promise<void>;
  
  setConsumption: (c: string) => void;
  setFuelAmounts: (updater: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  setCurrency: (c: string) => void;
  setExchangeRates: (rates: Record<string, number>) => void;
  
  resetTrip: () => void;
}

export const useTripStore = create<TripState>((set, get) => ({
  stops: [
    { id: 'start-1', value: '' }, // from
    { id: 'end-2', value: '' }  // to
  ],
  isCalculated: false,
  isLoading: false,
  error: null,
  totalDistance: 0,
  totalDuration: 0,
  waypoints: [],
  routeGeometry: [],
  crossedCountries: [],
  activePanel: 'fuel',
  fuelPrices: {},
  selectedFuelType: 'gasoline',
  consumption: "",
  fuelAmounts: {},
  currency: "EUR",
  exchangeRates: { EUR: 1, UAH: 42.5, USD: 1.08, PLN: 4.3 },

  setStops: (stops) => set({ stops }),
  
  addStop: () => {
    const stops = get().stops;
    const newStop = { id: Date.now().toString(), value: '' };
    // insert before the last one (finish)
    const newStops = [...stops];
    newStops.splice(newStops.length - 1, 0, newStop);
    set({ stops: newStops });
  },
  
  removeStop: (id: string) => {
    const stops = get().stops;
    if (stops.length <= 2) return; // don't remove if only 2 left
    set({ stops: stops.filter(s => s.id !== id) });
  },

  updateStop: (id, value) => {
    const stops = get().stops;
    set({ stops: stops.map(s => s.id === id ? { ...s, value } : s) });
  },

  calculateRoute: async () => {
    const { stops } = get();
    const validStops = stops.filter(s => s.value.trim().length > 0);
    
    if (validStops.length < 2) {
       set({ error: 'Потрібно щонайменше 2 зупинки.' });
       return;
    }

    set({ isLoading: true, error: null, isCalculated: false });

    try {
      // 1. Geocode cities sequentially
      const geocodedPoints: GeocodeResult[] = [];
      for (const stop of validStops) {
        const geo = await geocodeCity(stop.value);
        if (geo) geocodedPoints.push(geo);
        else {
          set({ isLoading: false, error: `Не вдалося знайти: ${stop.value}` });
          return;
        }
      }

      // 2. Get Route
      const route = await getRoute(geocodedPoints);

      if (!route) {
        set({ isLoading: false, error: 'Не вдалося прокласти маршрут.' });
        return;
      }

      // 3. Generate Waypoints dynamically
      const waypoints: Waypoint[] = [];
      const countries = new Set<string>();
      
      let accumulatedDistance = 0;
      let accumulatedTime = 0;

      // Add user stops
      for (let i = 0; i < geocodedPoints.length; i++) {
         const pt = geocodedPoints[i];
         countries.add(pt.countryCode);
         
         if (i > 0) {
            const prevLeg = route.legs[i - 1];
            if (prevLeg) {
               accumulatedDistance += prevLeg.distanceKm;
               accumulatedTime += prevLeg.durationMins;
            }
         }
         
         waypoints.push({
           id: validStops[i].id,
           name: pt.name,
           type: i === 0 ? 'start' : i === geocodedPoints.length - 1 ? 'finish' : 'stop',
           distanceFromStart: accumulatedDistance,
           timeFromStart: accumulatedTime,
           lat: pt.lat,
           lon: pt.lon
         });
      }

      // Check for borders
      const borders = await findBorders(route.geometry);
      for (const border of borders) {
        countries.add(border.toCountry);
        const ratio = border.geometryIndex / route.geometry.length;
        waypoints.push({
          id: `border-${border.geometryIndex}`,
          name: `Кордон ${border.fromCountry} → ${border.toCountry} (поруч з ${border.name})`,
          type: 'border',
          distanceFromStart: Math.round(route.distanceKm * ratio),
          timeFromStart: Math.round(route.durationMins * ratio),
          lat: border.lat,
          lon: border.lon
        });
      }

      // Recommend hotel stop every 8 hours (480 mins)
      if (route.durationMins > 480) {
        const stopsCount = Math.floor(route.durationMins / 480);
        for (let i = 1; i <= stopsCount; i++) {
          const ratio = (480 * i) / route.durationMins;
          const geomIndex = Math.floor(route.geometry.length * ratio);
          const point = route.geometry[geomIndex];
          
          const geo = await reverseGeocode(point[0], point[1]);
          const cityName = geo && geo.city !== "Невідома локація" ? geo.city : 'Невідомо';
          
          waypoints.push({
            id: `hotel-${i}`,
            name: `Ночівля у м. ${cityName}`,
            type: 'stop',
            distanceFromStart: Math.round(route.distanceKm * ratio),
            timeFromStart: 480 * i,
            lat: point[0],
            lon: point[1]
          });
        }
      }

      // Sort waypoints strictly by distance to ensure correct timeline flow
      waypoints.sort((a, b) => a.distanceFromStart - b.distanceFromStart);
      
      // No auto-open by default
      const nextActivePanel: PanelType | null = null;

      set({
        isCalculated: true,
        isLoading: false,
        error: null,
        totalDistance: route.distanceKm,
        totalDuration: route.durationMins,
        routeGeometry: route.geometry,
        crossedCountries: Array.from(countries),
        waypoints,
        activePanel: nextActivePanel
      });
    } catch (err) {
      console.error(err);
      set({ isLoading: false, error: 'Сталася помилка при розрахунку маршруту.' });
    }
  },

  setActivePanel: (panel) => set({ activePanel: panel }),
  
  setFuelType: (type) => set({ selectedFuelType: type }),
  
  setConsumption: (c) => set({ consumption: c }),
  setFuelAmounts: (updater) => set((state) => ({ 
    fuelAmounts: typeof updater === 'function' ? updater(state.fuelAmounts) : updater 
  })),
  setCurrency: (c) => set({ currency: c }),
  setExchangeRates: (rates) => set((state) => ({ exchangeRates: { ...state.exchangeRates, ...rates } })),

  fetchFuelPrices: async () => {
    try {
      const res = await fetch('/api/fuel-prices');
      if (!res.ok) throw new Error('Failed to fetch fuel prices');
      const data = await res.json();
      if (data.success && data.prices) {
        set({ fuelPrices: data.prices });
      }
    } catch (error) {
      console.error('Error fetching fuel prices:', error);
    }
  },
  
  resetTrip: () => set({ 
    stops: [
      { id: Date.now().toString(), value: '' }, 
      { id: (Date.now()+1).toString(), value: '' }
    ],
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
