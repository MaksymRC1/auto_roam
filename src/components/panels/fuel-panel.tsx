"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useTripStore, FuelType } from "@/store/useTripStore";

export function FuelPanel() {
  const { 
    totalDistance, fuelPrices, fetchFuelPrices, selectedFuelType, setFuelType, crossedCountries,
    consumption, setConsumption, fuelAmounts, setFuelAmounts, currency, setCurrency, exchangeRates, setExchangeRates
  } = useTripStore();

  // Fetch real exchange rates on mount
  useEffect(() => {
    fetch("https://api.exchangerate-api.com/v4/latest/EUR")
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) {
          setExchangeRates(data.rates);
        }
      })
      .catch(err => console.error("Failed to fetch exchange rates:", err));
  }, []);

  const rate = exchangeRates[currency] || 1;
  const currencySymbol = currency === "EUR" ? "€" : currency === "UAH" ? "₴" : currency === "USD" ? "$" : "zł";

  useEffect(() => {
    fetchFuelPrices();
  }, [fetchFuelPrices]);

  const regionNames = useMemo(() => new Intl.DisplayNames(['uk'], { type: 'region' }), []);

  const toggleCountry = (code: string) => {
    setFuelAmounts((prev) => {
      const next = { ...prev };
      if (next[code] !== undefined) {
        delete next[code];
      } else {
        next[code] = "";
      }
      return next;
    });
  };

  const updateAmount = (code: string, amount: string) => {
    setFuelAmounts((prev) => ({ ...prev, [code]: amount }));
  };

  // Calculations
  const numericConsumption = parseFloat(consumption) || 0;
  const totalFuel = (totalDistance / 100) * numericConsumption;
  const conservativeFuel = Math.round(totalFuel * 1.1); // 10% buffer, rounded

  let distributedFuel = 0;
  let totalCostEur = 0;

  Object.entries(fuelAmounts).forEach(([code, amountStr]) => {
    const amount = parseFloat(amountStr) || 0;
    const priceEur = fuelPrices[code]?.[selectedFuelType] || 0;
    distributedFuel += amount;
    totalCostEur += amount * priceEur;
  });

  const remainingFuel = Math.max(0, conservativeFuel - distributedFuel);
  const isWarning = remainingFuel > 0.1;

  const totalCostLocal = Math.round(totalCostEur * rate);

  return (
    <Card className="flex-1 flex flex-col m-0 border-blue-100 shadow-sm">
      <CardHeader className="bg-blue-50/50 pb-4 border-b">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <span>⛽</span> Розрахунок палива
            </CardTitle>
            <CardDescription>
              Маршрут: {totalDistance} км. Актуальні європейські ціни.
            </CardDescription>
          </div>
          <Select value={currency} onValueChange={(v) => { if (v) setCurrency(v); }}>
            <SelectTrigger className="w-24 h-8 text-xs bg-white">
              <SelectValue placeholder="Валюта" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="UAH">UAH (₴)</SelectItem>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="PLN">PLN (zł)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Тип палива</Label>
            <Select value={selectedFuelType} onValueChange={(v) => { 
              if (v) {
                setFuelType(v as FuelType); 
                setConsumption("");
                setFuelAmounts({});
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Виберіть паливо">
                  {selectedFuelType === 'gasoline' ? 'Бензин' : selectedFuelType === 'diesel' ? 'Дизель' : 'Газ'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gasoline">Бензин</SelectItem>
                <SelectItem value="diesel">Дизель</SelectItem>
                <SelectItem value="lpg">Газ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Витрата (л/100 км)</Label>
            <Input 
              type="text"
              inputMode="decimal"
              value={consumption} 
              onChange={(e) => setConsumption(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))} 
              className={`[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                !consumption ? 'border-amber-500 ring-1 ring-amber-500 bg-amber-50' : ''
              }`}
            />
          </div>
        </div>

        {crossedCountries.length > 0 && (
          <div className="space-y-4">
             <Label>Країни для заправки (натисніть, щоб додати об'єм)</Label>
             <div className="flex flex-wrap gap-2">
                {crossedCountries.map(code => {
                  const countryName = regionNames.of(code) || code;
                  const priceEur = fuelPrices[code]?.[selectedFuelType];
                  const isSelected = fuelAmounts[code] !== undefined;
                  const priceLocal = priceEur ? (priceEur * rate).toFixed(2) : null;
                  
                  return (
                    <button
                      key={code}
                      onClick={() => toggleCountry(code)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {countryName} {priceLocal ? `(${currencySymbol}${priceLocal})` : ''}
                    </button>
                  );
                })}
             </div>

             {Object.keys(fuelAmounts).length > 0 && (
               <div className="space-y-3 pt-2">
                 {Object.entries(fuelAmounts).map(([code, amount]) => {
                    const countryName = regionNames.of(code) || code;
                    const priceEur = fuelPrices[code]?.[selectedFuelType] || 0;
                    const priceLocal = priceEur * rate;
                    const countryCostLocal = Math.round((parseFloat(amount) || 0) * priceLocal);

                    return (
                      <div key={code} className="flex items-center gap-3">
                        <div className="flex-1">
                          <Label className="text-xs text-slate-500 mb-1 block">
                            {countryName} ({currencySymbol}{priceLocal.toFixed(2)}/л)
                          </Label>
                          <div className="relative">
                            <Input 
                              type="text"
                              inputMode="decimal"
                              value={amount}
                              onChange={(e) => updateAmount(code, e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))}
                              className="pr-8 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">л</span>
                          </div>
                        </div>
                        <div className="w-24 text-right pt-5 text-sm font-medium text-slate-700">
                          {currencySymbol} {countryCostLocal}
                        </div>
                      </div>
                    );
                 })}
               </div>
             )}
          </div>
        )}

        <div className="rounded-lg bg-slate-50 p-4 space-y-3 border">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 flex items-center gap-1">
              Кількість палива:
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-slate-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Включає 10% запасу для більш надійного розрахунку</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <span className="font-semibold">{Math.round(conservativeFuel)} л</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Всього розподілено:</span>
            <span className="font-semibold text-slate-700">{Math.round(distributedFuel)} л</span>
          </div>

          {isWarning && (
            <div className="flex justify-between text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
              <span>Залишилось розподілити:</span>
              <span className="font-semibold">{Math.round(remainingFuel)} л</span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
            <span className="text-slate-700">Орієнтовна вартість:</span>
            <span className="text-blue-600">{currencySymbol} {totalCostLocal}</span>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
