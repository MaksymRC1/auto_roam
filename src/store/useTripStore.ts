import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import LZString from 'lz-string';
import { geocodeCity, getRoute, findBorders, reverseGeocode, GeocodeResult, buildCumulativeDistances, geometryIndexToRatio, ratioToGeometryIndex } from '@/lib/routing';
import type { BorderPoint } from '@/lib/borders';
import { getCountryName } from '@/lib/country-names';

import { FUEL_BUFFER_RATIO, LONG_TRIP_THRESHOLD_MINS, DEFAULT_FUEL_CONSUMPTION } from '@/lib/constants';

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
  fromCountry?: string;
  toCountry?: string;
  borderId?: string;
}

export const averageHotelPriceEur: Record<string, number> = {
  UA: 30, PL: 50, DE: 80, AT: 90, FR: 100, CH: 120, IT: 90, RO: 40, HU: 50, SK: 50, CZ: 60,
};
export function getHotelPrice(countryCode: string) {
  return averageHotelPriceEur[countryCode] || 60;
}

export function isHotelActive(wpId: string, hotelCustomTime: number, hotelOverrides: Record<string, HotelOverride>) {
  const override = hotelOverrides[wpId];
  if (override?.skipped !== undefined) {
    return !override.skipped;
  }
  return hotelCustomTime > 0;
}

export type PanelType = 'map' | 'fuel' | 'hotel' | 'borders' | 'budget' | 'insurance';

export interface StopInput {
  id: string;
  value: string;
  isBorderOverride?: boolean;
  borderFrom?: string;
  borderTo?: string;
  borderId?: string;
}

export interface HotelOverride {
  name?: string;
  url?: string;
  lat?: number;
  lon?: number;
  priceEur?: number;
  inputPrice?: number;
  inputCurrency?: string;
  skipped?: boolean;
}

interface TripState {
  stops: StopInput[];
  isCalculated: boolean;
  isLoading: boolean;
  error: string | null;
  totalDistance: number; // km
  totalDuration: number; // min
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
  insertBorderStop: (borderPoint: BorderPoint, previousStopDistance: number) => void;
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
  
  autoAssignFuel: () => void;
  resetTrip: () => void;
  
  insuranceCost: number;
  includeReserve: boolean;
  completedWaypoints: string[];
  setInsuranceCost: (cost: number) => void;
  toggleReserve: () => void;
  toggleWaypointCompletion: (id: string) => void;
  getShareUrl: () => string;
  getRawShareData: () => any;
  loadFromShareData: (data: string) => void;
  loadFromRawData: (data: any) => void;
}

// Race condition guard: incremented on each calculateRoute call
let calculateRequestId = 0;

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      stops: [
    { id: 'start-1', value: '' }, // from
    { id: 'end-2', value: '' }  // to
  ],
  isCalculated: false,
  isLoading: false,
  error: null,
  totalDistance: 0,
  totalDuration: 0,
  updateWaypoint: (id, updates) => set(state => ({
    waypoints: state.waypoints.map(wp => wp.id === id ? { ...wp, ...updates } : wp)
  })),
  waypoints: [],
  ignoredWaypoints: [],
  ignoreWaypoint: (id) => set(state => {
    if (state.ignoredWaypoints.includes(id)) return state;
    return { ignoredWaypoints: [...state.ignoredWaypoints, id] };
  }),
  routeGeometry: [],
  crossedCountries: [],
  activePanel: 'fuel',
  fuelPrices: {},
  selectedFuelType: 'gasoline',
  consumption: String(DEFAULT_FUEL_CONSUMPTION),
  isDefaultConsumption: true,
  fuelAmounts: {},
  currency: "EUR",
  exchangeRates: { EUR: 1, UAH: 42.5, USD: 1.08 },
  hotelMode: 'time',
  hotelCustomTime: LONG_TRIP_THRESHOLD_MINS,
  hotelCustomDistance: 800,
  hotelOverrides: {},
  insuranceCost: 0,
  includeReserve: true,
  completedWaypoints: [],

  setStops: (stops) => set({ stops }),
  
  addStop: () => {
    const stops = get().stops;
    const newStop = { id: crypto.randomUUID(), value: '' };
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
    const newStops = stops.map(s => s.id === id ? { ...s, value } : s);
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
        id: crypto.randomUUID(),
        value: `${borderPoint.name} | ${borderPoint.lat},${borderPoint.lon}`,
        isBorderOverride: true,
        borderFrom: fromCode,
        borderTo: toCode,
        borderId: borderPoint.id
      });
      return { stops };
    });
    get().calculateRoute();
  },

  calculateRoute: async () => {
    const { stops } = get();
    const validStops = stops.filter(s => s.value.trim().length > 0);
    
    if (validStops.length < 2) {
       set({ isCalculated: false, error: 'Потрібно щонайменше 2 зупинки.' });
       return;
    }

    // Race condition guard
    const thisRequestId = ++calculateRequestId;

    set({ isLoading: true, error: null, ignoredWaypoints: [] });

    try {
      // 1. Geocode cities in parallel
      const geocodeResults = await Promise.all(
        validStops.map(stop => geocodeCity(stop.value))
      );

      // Bail out if a newer request was initiated
      if (thisRequestId !== calculateRequestId) return;

      const geocodedPoints: GeocodeResult[] = [];
      for (let i = 0; i < geocodeResults.length; i++) {
        if (geocodeResults[i]) geocodedPoints.push(geocodeResults[i]!);
        else {
          set({ isLoading: false, error: `Не вдалося знайти: ${validStops[i].value}` });
          return;
        }
      }

      // 2. Get Route
      const route = await getRoute(geocodedPoints);

      if (thisRequestId !== calculateRequestId) return;

      if (!route) {
        set({ isLoading: false, isCalculated: false, error: 'Не вдалося прокласти маршрут.' });
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
           name: validStops[i].isBorderOverride ? `Пункт пропуску ${getCountryName(validStops[i].borderFrom!)} → ${getCountryName(validStops[i].borderTo!)} (${pt.name.split('|')[0].trim()})` : pt.name,
           type: validStops[i].isBorderOverride ? 'border' : (i === 0 ? 'start' : i === geocodedPoints.length - 1 ? 'finish' : 'stop'),
           distanceFromStart: accumulatedDistance,
           timeFromStart: accumulatedTime,
           lat: pt.lat,
           lon: pt.lon,
           countryCode: pt.countryCode,
           fromCountry: validStops[i].borderFrom,
           toCountry: validStops[i].borderTo,
           borderId: validStops[i].borderId
         });
      }

      // Check for borders
      const borders = await findBorders(route.geometry);

      if (thisRequestId !== calculateRequestId) return;

      // Build cumulative distance array for accurate geometry→distance mapping
      const cumDist = buildCumulativeDistances(route.geometry);

      const overriddenPairs = new Set(validStops.filter(s => s.isBorderOverride).map(s => `${s.borderFrom}-${s.borderTo}`));

      for (const border of borders) {
        countries.add(border.fromCountry);
        countries.add(border.toCountry);
        
        // Skip adding waypoint if user selected a custom border crossing for this pair
        if (overriddenPairs.has(`${border.fromCountry}-${border.toCountry}`)) {
           continue;
        }
        
        // Use real Haversine-based distance ratio instead of linear index ratio
        const ratio = geometryIndexToRatio(cumDist, border.geometryIndex);
        waypoints.push({
          id: `border-${border.geometryIndex}`,
          name: `Пункт пропуску ${getCountryName(border.fromCountry)} → ${getCountryName(border.toCountry)} (${border.name})`,
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

      set({
        isCalculated: true,
        isLoading: false,
        error: null,
        totalDistance: route.distanceKm,
        totalDuration: route.durationMins,
        routeGeometry: route.geometry,
        crossedCountries: Array.from(countries).filter(c => c !== 'UNKNOWN'),
        waypoints,
        activePanel: null
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

  // Task 2.4: Batch set() calls into one
  setHotelSettings: (mode, time, dist) => {
    set({
      hotelMode: mode,
      ...(time !== undefined && { hotelCustomTime: time }),
      ...(dist !== undefined && { hotelCustomDistance: dist }),
    });
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
        const timeLimit = state.hotelMode === 'auto' ? LONG_TRIP_THRESHOLD_MINS : state.hotelCustomTime;
        const layoutTimeLimit = timeLimit > 0 ? timeLimit : 8 * 60; // Default to 8h for layout if set to 0
        if (state.totalDuration > layoutTimeLimit) {
          stopsCount = Math.floor(state.totalDuration / layoutTimeLimit);
          ratioStep = layoutTimeLimit / state.totalDuration;
        }
      } else if (state.hotelMode === 'distance') {
        if (state.totalDistance > state.hotelCustomDistance && state.hotelCustomDistance > 0) {
          stopsCount = Math.floor(state.totalDistance / state.hotelCustomDistance);
          ratioStep = state.hotelCustomDistance / state.totalDistance;
        }
      }
      
      // Build cumulative distance array for accurate distance→geometry lookup
      const hotelCumDist = buildCumulativeDistances(state.routeGeometry);

      for (let i = 1; i <= stopsCount; i++) {
        const ratio = ratioStep * i;
        // Use binary search on cumulative distances instead of linear index ratio
        const geomIndex = ratioToGeometryIndex(hotelCumDist, ratio);
        const point = state.routeGeometry[geomIndex];
        if (!point) continue;
        
        const geo = await reverseGeocode(point[0], point[1]);
        const cityName = geo?.city || 'Траса';
        const name = cityName === 'Траса' ? 'Зупинка' : `Ночівля: ${cityName}`;
        let countryCode = geo?.countryCode || 'UNKNOWN';
        
        const dist = state.totalDistance * ratio;
        
        // Fallback: Infer country from crossed borders if API fails
        if (countryCode === 'UNKNOWN' && state.crossedCountries.length > 0) {
           let inferred = state.crossedCountries[0];
           const borderWps = state.waypoints.filter(wp => wp.type === 'border').sort((a,b) => a.distanceFromStart - b.distanceFromStart);
           
           for (const border of borderWps) {
              if (dist > border.distanceFromStart && border.toCountry) {
                 inferred = border.toCountry;
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
    if (isNaN(numericConsumption) || numericConsumption <= 0 || state.totalDistance === 0 || state.crossedCountries.length === 0 || Object.keys(state.fuelPrices).length === 0) {
      return;
    }
    const totalFuel = (state.totalDistance / 100) * numericConsumption;
    const conservativeFuel = Math.round(totalFuel * FUEL_BUFFER_RATIO);
    
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
  // Task 1.7: Full reset of ALL fields
  setInsuranceCost: (cost) => set({ insuranceCost: cost }),
  toggleReserve: () => set(state => ({ includeReserve: !state.includeReserve })),
  toggleWaypointCompletion: (id) => set(state => {
    if (state.completedWaypoints.includes(id)) {
      return { completedWaypoints: state.completedWaypoints.filter(w => w !== id) };
    }
    return { completedWaypoints: [...state.completedWaypoints, id] };
  }),
  getRawShareData: () => {
    const state = get();
    return {
      stops: state.stops,
      consumption: state.consumption,
      fuelAmounts: state.fuelAmounts,
      currency: state.currency,
      hotelOverrides: state.hotelOverrides,
      hotelMode: state.hotelMode,
      insuranceCost: state.insuranceCost,
      includeReserve: state.includeReserve,
    };
  },
  getShareUrl: () => {
    const shareData = get().getRawShareData();
    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(shareData));
    return `${window.location.origin}/?trip=${compressed}`;
  },
  loadFromShareData: (data) => {
    try {
      const decompressed = LZString.decompressFromEncodedURIComponent(data);
      if (decompressed) {
        const parsed = JSON.parse(decompressed);
        set({
          ...parsed,
          isCalculated: false,
          isLoading: false,
          completedWaypoints: []
        });
        setTimeout(() => get().calculateRoute(), 0);
      }
    } catch (err) {
      console.error("Failed to load shared trip", err);
    }
  },
  loadFromRawData: (parsed) => {
    try {
      if (parsed) {
        set({
          ...parsed,
          isCalculated: false,
          isLoading: false,
          completedWaypoints: []
        });
        setTimeout(() => get().calculateRoute(), 0);
      }
    } catch (err) {
      console.error("Failed to load raw shared trip", err);
    }
  },

  resetTrip: () => set({ 
    stops: [
      { id: crypto.randomUUID(), value: '' }, 
      { id: crypto.randomUUID(), value: '' }
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
    fuelAmounts: {},
    consumption: String(DEFAULT_FUEL_CONSUMPTION),
    isDefaultConsumption: true,
    selectedFuelType: 'gasoline' as FuelType,
    hotelOverrides: {},
    hotelMode: 'time' as const,
    hotelCustomTime: LONG_TRIP_THRESHOLD_MINS,
    hotelCustomDistance: 800,
    ignoredWaypoints: [],
    currency: 'EUR',
    exchangeRates: { EUR: 1, UAH: 42.5, USD: 1.08 },
    insuranceCost: 0,
    includeReserve: true,
    completedWaypoints: [],
  }),
    }),
    {
      name: 'autoroam-trip-storage',
      partialize: (state) => ({
        stops: state.stops,
        isCalculated: state.isCalculated,
        totalDistance: state.totalDistance,
        totalDuration: state.totalDuration,
        hotelOverrides: state.hotelOverrides,
        waypoints: state.waypoints,
        ignoredWaypoints: state.ignoredWaypoints,
        routeGeometry: state.routeGeometry,
        crossedCountries: state.crossedCountries,
        activePanel: state.activePanel,
        fuelPrices: state.fuelPrices,
        selectedFuelType: state.selectedFuelType,
        consumption: state.consumption,
        isDefaultConsumption: state.isDefaultConsumption,
        fuelAmounts: state.fuelAmounts,
        currency: state.currency,
        exchangeRates: state.exchangeRates,
        hotelMode: state.hotelMode,
        hotelCustomTime: state.hotelCustomTime,
        hotelCustomDistance: state.hotelCustomDistance,
        insuranceCost: state.insuranceCost,
        includeReserve: state.includeReserve,
        completedWaypoints: state.completedWaypoints,
      }),
    }
  )
);
