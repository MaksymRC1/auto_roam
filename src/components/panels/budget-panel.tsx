"use client";

import { useTripStore, getHotelPrice } from "@/store/useTripStore";
import { ShieldAlert } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VIGNETTE_DB } from "@/lib/borders";
import { getCurrencySymbol, EMERGENCY_RESERVE_RATIO } from "@/lib/constants";

export function BudgetPanel() {
  const { 
    waypoints, 
    currency, 
    setCurrency, 
    exchangeRates,
    fuelAmounts,
    fuelPrices,
    selectedFuelType,
    hotelOverrides,
    crossedCountries
  } = useTripStore();

  // 1. Fuel Cost (Dynamic)
  let totalFuelCostEur = 0;
  let totalFuelLiters = 0;
  Object.entries(fuelAmounts).forEach(([code, amountStr]) => {
    const amount = parseFloat(amountStr) || 0;
    const priceEur = fuelPrices[code]?.[selectedFuelType] || 0;
    totalFuelCostEur += amount * priceEur;
    totalFuelLiters += amount;
  });

  // 2. Hotel Cost (Dynamic)
  const hotelStops = waypoints.filter(wp => wp.type === 'stop' && wp.id.startsWith('hotel-'));
  const hotelCostEur = hotelStops.reduce((sum, wp) => {
    const override = hotelOverrides[wp.id];
    if (override && override.priceEur !== undefined) {
      return sum + override.priceEur;
    }
    return sum + getHotelPrice(wp.countryCode || 'UNKNOWN');
  }, 0);
  const stopsCount = hotelStops.length;

  // 3. Vignette costs (real data from VIGNETTE_DB)
  const vignetteCostEur = crossedCountries.reduce((sum, code) => {
    const vignette = VIGNETTE_DB[code];
    return sum + (vignette ? vignette.priceEur : 0);
  }, 0);

  // 4. Totals
  const subtotalEur = totalFuelCostEur + hotelCostEur + vignetteCostEur;
  const reserveEur = subtotalEur * EMERGENCY_RESERVE_RATIO;
  const totalEur = subtotalEur + reserveEur;

  // Conversion
  const rate = exchangeRates[currency] || 1;
  const symbol = getCurrencySymbol(currency);

  const formatCost = (eur: number) => {
    return `${(eur * rate).toFixed(0)} ${symbol}`;
  };

  return (
    <div className="flex-1 flex flex-col space-y-4">
      <div className="pb-4 border-b border-white/10 flex justify-end">
          <Tabs value={currency} onValueChange={(v) => setCurrency(v)} className="w-full md:w-[240px]">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="EUR">EUR</TabsTrigger>
              <TabsTrigger value="USD">USD</TabsTrigger>
              <TabsTrigger value="UAH">UAH</TabsTrigger>
              <TabsTrigger value="PLN">PLN</TabsTrigger>
            </TabsList>
          </Tabs>
      </div>
      
      <div className="pt-2 space-y-6">
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-lg">⛽</span>
              </div>
              <div>
                <p className="font-semibold text-white/90">Паливо</p>
                <p className="text-xs text-white/50">~{totalFuelLiters.toFixed(0)} л за поточним розподілом</p>
              </div>
            </div>
            <span className="font-bold text-white/90">{formatCost(totalFuelCostEur)}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-lg">🏨</span>
              </div>
              <div>
                <p className="font-semibold text-white/90">Ночівля</p>
                <p className="text-xs text-white/50">{stopsCount} {
                  stopsCount % 10 === 1 && stopsCount % 100 !== 11 ? 'зупинка' :
                  stopsCount % 10 >= 2 && stopsCount % 10 <= 4 && (stopsCount % 100 < 10 || stopsCount % 100 >= 20) ? 'зупинки' : 'зупинок'
                }</p>
              </div>
            </div>
            <span className="font-bold text-white/90">{formatCost(hotelCostEur)}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <span className="text-lg">🛂</span>
              </div>
              <div>
                <p className="font-semibold text-white/90">Віньєтки та збори</p>
                <p className="text-xs text-white/50">Оплата платних доріг</p>
              </div>
            </div>
            <span className="font-bold text-white/90">{formatCost(vignetteCostEur)}</span>
          </div>

          <div className="h-px bg-white/10 my-2" />

          <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-orange-400">Резерв на непередбачувані витрати</p>
                <p className="text-xs text-orange-300">+{Math.round(EMERGENCY_RESERVE_RATIO * 100)}% від загальної суми</p>
              </div>
            </div>
            <span className="font-bold text-orange-400">{formatCost(reserveEur)}</span>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-800 p-6 text-white flex flex-col md:flex-row md:items-center justify-between shadow-lg gap-4">
          <div>
            <p className="text-emerald-100 text-sm mb-1 font-medium">Разом (орієнтовно)</p>
            <p className="text-4xl font-bold tracking-tight">{formatCost(totalEur)}</p>
          </div>
          <div className="flex flex-col md:items-end text-sm text-emerald-100">
            <p className="flex justify-between w-full md:w-auto gap-4">
              <span>Без резерву:</span> 
              <span className="font-semibold">{formatCost(subtotalEur)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
