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
  countryCode?: string;
  hotelPrice?: number;
  fromCountry?: string;
  toCountry?: string;
}

export const averageHotelPriceEur: Record<string, number> = {
  UA: 30, PL: 50, DE: 80, AT: 90, FR: 100, CH: 120, IT: 90, RO: 40, HU: 50, SK: 50, CZ: 60,
};
export function getHotelPrice(countryCode: string) {
  return averageHotelPriceEur[countryCode] || 60;
}

export type PanelType = 'map' | 'fuel' | 'hotel' | 'borders' | 'budget';

export interface StopInput {
  id: string;
  value: string;
  isBorderOverride?: boolean;
  borderFrom?: string;
  borderTo?: string;
}

export interface HotelOverride {
  name?: string;
  url?: string;
  lat?: number;
  lon?: number;
  priceEur?: number;
}

interface TripState {
  stops: StopInput[];
  isCalculated: boolean;
  isLoading: boolean;
  error: string | null;
  totalDistance: number; // km
  totalDuration: number; // min
  setTotalDistance: (dist: number) => void;
  setTotalDuration: (dur: number) => void;
  hotelOverrides: Record<string, HotelOverride>;
  setHotelOverride: (id: string, override: Partial<HotelOverride>) => void;
  updateWaypoint: (id: string, updates: Partial<Waypoint>) => void;
  waypoints: Waypoint[];
  ignoredWaypoints: string[];
  ignoreWaypoint: (id: string) => void;
  routeGeometry: [number, number][]; // Array of [lat, lon]
  crossedCountries: string[]; // ISO Country codes e.g. UA, PL
  activePanel: PanelType | null;
  
  fuelPrices: Record<string, FuelPricesData>;
  selectedFuelType: FuelType;
  
  consumption: string;
  isDefaultConsumption: boolean;
  fuelAmounts: Record<string, string>;
  currency: string;
  exchangeRates: Record<string, number>;
  
  setStops: (stops: StopInput[]) => void;
  addStop: () => void;
  removeStop: (id: string) => void;
  updateStop: (id: string, value: string) => void;
  insertBorderStop: (borderPoint: any, previousStopDistance: number) => void;
  calculateRoute: () => Promise<void>;
  setActivePanel: (panel: PanelType | null) => void;
  setFuelType: (type: FuelType) => void;
  fetchFuelPrices: () => Promise<void>;
  
  setConsumption: (c: string, isDefault?: boolean) => void;
  setFuelAmounts: (updater: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  setCurrency: (c: string) => void;
  setExchangeRates: (rates: Record<string, number>) => void;
  
  hotelMode: 'auto' | 'time' | 'distance' | 'ignore';
  hotelCustomTime: number; // in mins
  hotelCustomDistance: number; // in km
  setHotelSettings: (mode: 'auto'|'time'|'distance'|'ignore', time?: number, dist?: number) => void;
  recalculateHotels: () => Promise<void>;
  
  hotelOverrides: Record<string, HotelOverride>;
  setHotelOverride: (id: string, override: Partial<HotelOverride>) => void;
  
  autoAssignFuel: () => void;
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
  setTotalDistance: (totalDistance) => set({ totalDistance }),
  setTotalDuration: (totalDuration) => set({ totalDuration }),
  updateWaypoint: (id, updates) => set(state => ({
    waypoints: state.waypoints.map(wp => wp.id === id ? { ...wp, ...updates } : wp)
  })),
  waypoints: [],
  ignoredWaypoints: [],
  ignoreWaypoint: (id) => set(state => ({ ignoredWaypoints: [...state.ignoredWaypoints, id] })),
  routeGeometry: [],
  crossedCountries: [],
  activePanel: 'fuel',
  fuelPrices: {},
  selectedFuelType: 'gasoline',
  consumption: "8",
  isDefaultConsumption: true,
  fuelAmounts: {},
  currency: "EUR",
  exchangeRates: { EUR: 1, UAH: 42.5, USD: 1.08, PLN: 4.3 },
  hotelMode: 'auto',
  hotelCustomTime: 480,
  hotelCustomDistance: 800,
  hotelOverrides: {},

  setStops: (stops) => set({ stops }),
  
  addStop: () => {
    const stops = get().stops;
    const newStop = { id: Date.now().toString(), value: '' };
    // insert before the last one (finish)
    const newStops = [...stops];
    newStops.splice(newStops.length - 1, 0, newStop);
    set({ stops: newStops });
  },
  
  removeStop: (id) => set((state) => {
    if (state.stops.length <= 2) return state;
    return { stops: state.stops.filter((s) => s.id !== id) };
  }),

  updateStop: (id, value) => {
    const stops = get().stops;
    const newStops = stops.filter(s => !s.isBorderOverride).map(s => s.id === id ? { ...s, value } : s);
    set({ stops: newStops });
  },

  insertBorderStop: (borderPoint, previousStopDistance) => {
    set((state) => {
      let stops = [...state.stops];
      const fromCode = borderPoint.fromCountry;
      const toCode = borderPoint.toCountry;
      
      // Remove existing override for this country pair
      stops = stops.filter(s => !(s.isBorderOverride && s.borderFrom === fromCode && s.borderTo === toCode));
      
      const stopWaypoints = state.waypoints.filter(w => !w.id.startsWith('border-') && w.type !== 'border');
      
      let insertIndex = 0;
      for (let i = 0; i < stopWaypoints.length; i++) {
        if (stopWaypoints[i].distanceFromStart <= previousStopDistance) {
          const stopId = stopWaypoints[i].id;
          const idxInStops = stops.findIndex(s => s.id === stopId);
          if (idxInStops !== -1) insertIndex = idxInStops;
        }
      }
      
      stops.splice(insertIndex + 1, 0, {
        id: `override-${fromCode}-${toCode}`,
        value: `${borderPoint.name} | ${borderPoint.lat},${borderPoint.lon}`,
        isBorderOverride: true,
        borderFrom: fromCode,
        borderTo: toCode
      });
      return { stops };
    });
    get().calculateRoute();
  },

  setHotelOverride: (id, override) => set((state) => ({
    hotelOverrides: {
      ...state.hotelOverrides,
      [id]: { ...(state.hotelOverrides[id] || {}), ...override }
    }
  })),

  calculateRoute: async () => {
    const { stops } = get();
    const validStops = stops.filter(s => s.value.trim().length > 0);
    
    if (validStops.length < 2) {
       set({ error: 'Потрібно щонайменше 2 зупинки.' });
       return;
    }

    set({ isLoading: true, error: null, isCalculated: false, ignoredWaypoints: [] });

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

      // Add countries
      geocodedPoints.forEach(pt => countries.add(pt.countryCode));

      // Add user stops
      for (let i = 0; i < geocodedPoints.length; i++) {
         const pt = geocodedPoints[i];
         
         if (i > 0) {
            const prevLeg = route.legs[i - 1];
            if (prevLeg) {
               accumulatedDistance += prevLeg.distanceKm;
               accumulatedTime += prevLeg.durationMins;
            }
         }
         
         waypoints.push({
           id: validStops[i].id,
           name: validStops[i].isBorderOverride ? `Кордон ${validStops[i].borderFrom} → ${validStops[i].borderTo} (${pt.name.split('|')[0].trim()})` : pt.name,
           type: validStops[i].isBorderOverride ? 'border' : (i === 0 ? 'start' : i === geocodedPoints.length - 1 ? 'finish' : 'stop'),
           distanceFromStart: accumulatedDistance,
           timeFromStart: accumulatedTime,
           lat: pt.lat,
           lon: pt.lon,
           fromCountry: validStops[i].borderFrom,
           toCountry: validStops[i].borderTo
         });
      }

      // Check for borders
      const borders = await findBorders(route.geometry);
      const overriddenPairs = new Set(validStops.filter(s => s.isBorderOverride).map(s => `${s.borderFrom}-${s.borderTo}`));

      for (const border of borders) {
        countries.add(border.fromCountry);
        countries.add(border.toCountry);
        
        // Skip adding waypoint if user selected a custom border crossing for this pair
        if (overriddenPairs.has(`${border.fromCountry}-${border.toCountry}`)) {
           continue;
        }
        
        const ratio = border.geometryIndex / route.geometry.length;
        waypoints.push({
          id: `border-${border.geometryIndex}`,
          name: `Кордон ${border.fromCountry} → ${border.toCountry} (поруч з ${border.name})`,
          type: 'border',
          distanceFromStart: Math.round(route.distanceKm * ratio),
          timeFromStart: Math.round(route.durationMins * ratio),
          lat: border.lat,
          lon: border.lon,
          fromCountry: border.fromCountry,
          toCountry: border.toCountry
        });
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
        crossedCountries: Array.from(countries).filter(c => c !== 'UNKNOWN'),
        waypoints,
        activePanel: nextActivePanel
      });
      
      await get().recalculateHotels();
      
      // Auto-assign fuel if consumption is already entered
      get().autoAssignFuel();
    } catch (err) {
      console.error(err);
      set({ isLoading: false, error: 'Сталася помилка при розрахунку маршруту.' });
    }
  },

  setActivePanel: (panel) => set({ activePanel: panel }),
  
  setFuelType: (type) => set({ selectedFuelType: type }),
  
  setConsumption: (c, isDefault = false) => {
    set({ consumption: c, isDefaultConsumption: isDefault });
    get().autoAssignFuel();
  },
  setFuelAmounts: (updater) => set((state) => ({ 
    fuelAmounts: typeof updater === 'function' ? updater(state.fuelAmounts) : updater 
  })),
  setCurrency: (c) => set({ currency: c }),
  setExchangeRates: (rates) => set((state) => ({ exchangeRates: { ...state.exchangeRates, ...rates } })),

  setHotelSettings: (mode, time, dist) => {
    set({ hotelMode: mode });
    if (time !== undefined) set({ hotelCustomTime: time });
    if (dist !== undefined) set({ hotelCustomDistance: dist });
    get().recalculateHotels();
  },

  setHotelOverride: (id, override) => {
    set((state) => ({
      hotelOverrides: {
        ...state.hotelOverrides,
        [id]: { ...state.hotelOverrides[id], ...override }
      }
    }));
    get().recalculateHotels(); // Re-apply overrides to waypoints
  },

  recalculateHotels: async () => {
    const state = get();
    if (!state.isCalculated || state.routeGeometry.length === 0) return;
    
    // Remove existing hotels
    const baseWaypoints = state.waypoints.filter(wp => !(wp.type === 'stop' && wp.id.startsWith('hotel-')));
    const newHotels: Waypoint[] = [];
    
    if (state.hotelMode !== 'ignore') {
      let stopsCount = 0;
      let ratioStep = 0;
      
      if (state.hotelMode === 'auto' || state.hotelMode === 'time') {
        const timeLimit = state.hotelMode === 'auto' ? 480 : state.hotelCustomTime;
        if (state.totalDuration > timeLimit && timeLimit > 0) {
          stopsCount = Math.floor(state.totalDuration / timeLimit);
          ratioStep = timeLimit / state.totalDuration;
        }
      } else if (state.hotelMode === 'distance') {
        if (state.totalDistance > state.hotelCustomDistance && state.hotelCustomDistance > 0) {
          stopsCount = Math.floor(state.totalDistance / state.hotelCustomDistance);
          ratioStep = state.hotelCustomDistance / state.totalDistance;
        }
      }
      
      for (let i = 1; i <= stopsCount; i++) {
        const ratio = ratioStep * i;
        const geomIndex = Math.floor(state.routeGeometry.length * ratio);
        const point = state.routeGeometry[geomIndex];
        if (!point) continue;
        
        const geo = await reverseGeocode(point[0], point[1]);
        const cityName = geo?.city || 'Траса';
        const name = cityName === 'Траса' ? 'Ночівля на трасі' : `Ночівля: ${cityName}`;
        let countryCode = geo?.countryCode || 'UNKNOWN';
        
        const dist = state.totalDistance * ratio;
        
        // Fallback: Infer country from crossed borders if API fails
        if (countryCode === 'UNKNOWN' && state.crossedCountries.length > 0) {
           let inferred = state.crossedCountries[0];
           const borderWps = state.waypoints.filter(wp => wp.type === 'border').sort((a,b) => a.distanceFromStart - b.distanceFromStart);
           
           for (const border of borderWps) {
              if (dist > border.distanceFromStart) {
                 const match = border.name.match(/→\s*([A-Z]{2})/);
                 if (match) inferred = match[1];
              }
           }
           countryCode = inferred;
        }
        
        const override = state.hotelOverrides[`hotel-${i}`];
        
        newHotels.push({
          id: `hotel-${i}`,
          name: override?.name || name,
          type: 'stop',
          distanceFromStart: Math.round(dist),
          timeFromStart: Math.round(state.totalDuration * ratio),
          lat: override?.lat || point[0],
          lon: override?.lon || point[1],
          countryCode
        });
      }
    }
    
    const waypoints = [...baseWaypoints, ...newHotels].sort((a, b) => a.distanceFromStart - b.distanceFromStart);
    set({ waypoints });
  },

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

  autoAssignFuel: () => {
    const state = get();
    const numericConsumption = parseFloat(state.consumption.replace(',', '.'));
    if (isNaN(numericConsumption) || numericConsumption <= 0 || state.totalDistance === 0 || state.crossedCountries.length === 0) {
      return;
    }
    const totalFuel = (state.totalDistance / 100) * numericConsumption;
    const conservativeFuel = Math.round(totalFuel * 1.1);
    
    let nextAmounts = { ...state.fuelAmounts };
    let selectedKeys = Object.keys(nextAmounts);
    
    if (selectedKeys.length === 0) {
      // Pick global cheapest if nothing is selected
      let cheapestCountry = state.crossedCountries[0];
      let minPrice = Infinity;
      
      state.crossedCountries.forEach(country => {
        const price = state.fuelPrices[country]?.[state.selectedFuelType];
        if (price !== undefined && price > 0 && price < minPrice) {
          minPrice = price;
          cheapestCountry = country;
        }
      });
      
      if (cheapestCountry) {
        set({ fuelAmounts: { [cheapestCountry]: conservativeFuel.toString() } });
      }
    } else {
      // Pick cheapest selected and absorb the difference (similar to balanceFuel)
      let cheapestSelected = selectedKeys[0];
      let minPrice = Infinity;
      selectedKeys.forEach(c => {
        const price = state.fuelPrices[c]?.[state.selectedFuelType];
        if (price !== undefined && price > 0 && price < minPrice) {
          minPrice = price;
          cheapestSelected = c;
        }
      });
      
      let sumOthers = 0;
      Object.entries(nextAmounts).forEach(([k, v]) => {
        if (k !== cheapestSelected) {
          sumOthers += parseFloat(v as string) || 0;
        }
      });
      
      const newCheapestAmount = Math.max(0, conservativeFuel - sumOthers);
      nextAmounts[cheapestSelected] = (Math.round(newCheapestAmount * 10) / 10).toString();
      
      set({ fuelAmounts: nextAmounts });
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
