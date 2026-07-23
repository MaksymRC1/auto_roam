"use client";

import { useTripStore, getHotelPrice } from "@/store/useTripStore";
import { ShieldAlert, AlertTriangle, Fuel, Bed, Flag, ShieldCheck } from "lucide-react";
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
    crossedCountries,
    insuranceCost,
    setInsuranceCost,
    includeReserve,
    toggleReserve
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
  const hasAnyHotelOverride = hotelStops.some(wp => hotelOverrides[wp.id]?.priceEur !== undefined);

  const hotelCostEur = hotelStops.reduce((sum, wp) => {
    const override = hotelOverrides[wp.id];
    if (override && override.priceEur !== undefined) {
      return sum + override.priceEur;
    }
    return sum + (hasAnyHotelOverride ? 0 : getHotelPrice(wp.countryCode || 'UNKNOWN'));
  }, 0);
  const stopsCount = hotelStops.length;

  // 3. Vignette costs (real data from VIGNETTE_DB)
  const vignetteCostEur = crossedCountries.reduce((sum, code) => {
    const vignette = VIGNETTE_DB[code];
    return sum + (vignette ? vignette.priceEur : 0);
  }, 0);

  // 4. Totals
  const subtotalEur = totalFuelCostEur + hotelCostEur + vignetteCostEur + insuranceCost;
  const reserveEur = subtotalEur * EMERGENCY_RESERVE_RATIO;
  const totalEur = subtotalEur + (includeReserve ? reserveEur : 0);

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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="EUR">EUR</TabsTrigger>
              <TabsTrigger value="USD">USD</TabsTrigger>
              <TabsTrigger value="UAH">UAH</TabsTrigger>
            </TabsList>
          </Tabs>
      </div>
      
      <div className="pt-2 space-y-6">
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                <Fuel className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white/90">Паливо</p>
                {totalFuelLiters === 0 ? (
                  <p className="text-xs text-amber-500 mt-0.5 flex items-center gap-1 font-medium">
                    <AlertTriangle className="w-3 h-3" />
                    Необхідно розподілити паливо
                  </p>
                ) : (
                  <p className="text-xs text-white/50">~{totalFuelLiters.toFixed(0)} л за поточним розподілом</p>
                )}
              </div>
            </div>
            <span className="font-bold text-white/90">{formatCost(totalFuelCostEur)}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                <Bed className="w-4 h-4" />
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
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                <Flag className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white/90">Віньєтки та збори</p>
                <p className="text-xs text-white/50">Оплата платних доріг</p>
              </div>
            </div>
            <span className="font-bold text-white/90">{formatCost(vignetteCostEur)}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white/90">Страхування</p>
                <p className="text-xs text-white/50">Сума у {currency}</p>
              </div>
            </div>
            <div className="flex items-center">
              <input 
                type="number" 
                value={insuranceCost ? Math.round(insuranceCost * rate) : ''} 
                onChange={(e) => setInsuranceCost(Number(e.target.value) / rate)} 
                className="w-24 bg-black/50 border border-white/20 rounded-md px-2 py-1 text-right text-sm font-bold text-white focus:outline-none focus:border-white/40"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="h-px bg-white/10 my-2" />

          <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${includeReserve ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10 opacity-70'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${includeReserve ? 'bg-white/10 text-white' : 'bg-white/5 border border-white/10 text-white/50'}`}>
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <p className={`font-semibold ${includeReserve ? 'text-white/90' : 'text-white/60'}`}>Резерв на непередбачувані витрати</p>
                <p className={`text-xs ${includeReserve ? 'text-white/70' : 'text-white/40'}`}>+{Math.round(EMERGENCY_RESERVE_RATIO * 100)}% від загальної суми</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`font-bold ${includeReserve ? 'text-orange-400' : 'text-white/40 line-through'}`}>{formatCost(reserveEur)}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={includeReserve} onChange={() => toggleReserve()} />
                <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-800 p-6 text-white flex justify-center items-center shadow-lg">
          <p className="text-5xl font-bold tracking-tight text-center">{formatCost(totalEur)}</p>
        </div>
        <p className="text-center text-xs text-white/40 mt-3 px-4">
          * Загальна сума є орієнтовною та може відрізнятися від фактичних витрат
        </p>
      </div>
    </div>
  );
}
