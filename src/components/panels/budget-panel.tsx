"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useTripStore } from "@/store/useTripStore";
import { ShieldAlert } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Currency = 'EUR' | 'USD' | 'UAH';

// Mocked conversion rates (in a real app, this should come from an API)
const RATES = {
  EUR: 1,
  USD: 1.08,
  UAH: 42.5
};

const SYMBOLS = {
  EUR: '€',
  USD: '$',
  UAH: '₴'
};

export function BudgetPanel() {
  const { waypoints, totalDistance } = useTripStore();
  const [currency, setCurrency] = useState<Currency>('EUR');

  // Calculations (mock logic)
  const fuelConsumption = 8; // l/100km
  const fuelPriceEur = 1.6; // EUR/l
  const fuelLiters = (totalDistance / 100) * fuelConsumption;
  const fuelCostEur = fuelLiters * fuelPriceEur;

  // Assuming stops are for hotels
  const stops = waypoints.filter(wp => wp.type === 'stop').length;
  const hotelCostEur = stops > 0 ? stops * 45 : 0; // 45 EUR per stop

  // Assuming borders mean tolls/vignettes
  const borders = waypoints.filter(wp => wp.type === 'border').length;
  const vignetteCostEur = borders > 0 ? 15 : 0; // Assume 15 EUR for vignettes if crossing border

  const subtotalEur = fuelCostEur + hotelCostEur + vignetteCostEur;
  const reserveEur = subtotalEur * 0.15; // 15% emergency reserve
  const totalEur = subtotalEur + reserveEur;

  // Conversion
  const rate = RATES[currency];
  const symbol = SYMBOLS[currency];

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
          
          <Tabs value={currency} onValueChange={(v) => setCurrency(v as Currency)} className="w-full md:w-[240px]">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="EUR">EUR</TabsTrigger>
              <TabsTrigger value="USD">USD</TabsTrigger>
              <TabsTrigger value="UAH">UAH</TabsTrigger>
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
                <p className="text-xs text-slate-500">~{fuelLiters.toFixed(0)} л ({fuelConsumption} л/100км)</p>
              </div>
            </div>
            <span className="font-bold text-slate-700">{formatCost(fuelCostEur)}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="text-lg">🏨</span>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Ночівля</p>
                <p className="text-xs text-slate-500">{stops} зупинка(и)</p>
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
                <p className="text-xs text-orange-600/80">+15% від загальної суми</p>
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
