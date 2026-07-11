"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useTripStore, getHotelPrice } from "@/store/useTripStore";
import { ShieldAlert } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VIGNETTE_DB } from "@/lib/borders";
import { getCurrencySymbol, EMERGENCY_RESERVE_RATIO } from "@/lib/constants";

export function BudgetPanel() {
  const { 
    waypoints, 
    totalDistance, 
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
    <Card className="flex-1 flex flex-col m-0 border-emerald-100 shadow-sm">
      <CardHeader className="bg-emerald-50/50 pb-4 border-b">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <span>💰</span> Загальний кошторис
            </CardTitle>
            <CardDescription className="mt-1">
              Орієнтовні витрати на вашу подорож.
            </CardDescription>
          </div>
          
          <Tabs value={currency} onValueChange={(v) => setCurrency(v)} className="w-full md:w-[240px]">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="EUR">EUR</TabsTrigger>
              <TabsTrigger value="USD">USD</TabsTrigger>
              <TabsTrigger value="UAH">UAH</TabsTrigger>
              <TabsTrigger value="PLN">PLN</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6 bg-white">
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-lg">⛽</span>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Паливо</p>
                <p className="text-xs text-slate-500">~{totalFuelLiters.toFixed(0)} л за поточним розподілом</p>
              </div>
            </div>
            <span className="font-bold text-slate-700">{formatCost(totalFuelCostEur)}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="text-lg">🏨</span>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Ночівля</p>
                <p className="text-xs text-slate-500">{stopsCount} зупинка(и)</p>
              </div>
            </div>
            <span className="font-bold text-slate-700">{formatCost(hotelCostEur)}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-lg">🛂</span>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Віньєтки та збори</p>
                <p className="text-xs text-slate-500">Оплата платних доріг</p>
              </div>
            </div>
            <span className="font-bold text-slate-700">{formatCost(vignetteCostEur)}</span>
          </div>

          <div className="h-px bg-slate-200 my-2" />

          <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50/50 border border-orange-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-orange-800">Резерв на непередбачувані витрати</p>
                <p className="text-xs text-orange-600/80">+{Math.round(EMERGENCY_RESERVE_RATIO * 100)}% від загальної суми</p>
              </div>
            </div>
            <span className="font-bold text-orange-700">{formatCost(reserveEur)}</span>
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

      </CardContent>
    </Card>
  );
}
