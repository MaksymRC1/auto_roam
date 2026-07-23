"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import 'izitoast/dist/css/iziToast.min.css';


import { useTripStore, FuelType } from "@/store/useTripStore";
import { FUEL_BUFFER_RATIO, getCurrencySymbol } from "@/lib/constants";

export function FuelPanel() {
  const { 
    totalDistance, fuelPrices, fetchFuelPrices, selectedFuelType, setFuelType, crossedCountries,
    consumption, setConsumption, isDefaultConsumption, fuelAmounts, setFuelAmounts, currency, setCurrency, exchangeRates, setExchangeRates
  } = useTripStore();
  
  const [isFocused, setIsFocused] = useState(false);
  const [isAnyAmountFocused, setIsAnyAmountFocused] = useState(false);
  const lastToastTime = useRef(0);

  // Fetch real exchange rates on mount
  useEffect(() => {
    const controller = new AbortController();
    fetch("https://api.exchangerate-api.com/v4/latest/EUR", { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) {
          setExchangeRates(data.rates);
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') console.error("Failed to fetch exchange rates:", err);
      });
    return () => controller.abort();
  }, [setExchangeRates]);

  const rate = exchangeRates[currency] || 1;
  const currencySymbol = getCurrencySymbol(currency);

  useEffect(() => {
    fetchFuelPrices();
  }, [fetchFuelPrices]);

  const regionNames = useMemo(() => new Intl.DisplayNames(['uk'], { type: 'region' }), []);

  const balanceFuel = (nextAmounts: Record<string, string>, activeCode: string) => {
    const selectedCountries = Object.keys(nextAmounts);
    if (selectedCountries.length === 0) return nextAmounts;

    let cheapestSelected = selectedCountries[0];
    let minPrice = Infinity;
    selectedCountries.forEach(c => {
      const price = fuelPrices[c]?.[selectedFuelType];
      if (price !== undefined && price > 0 && price < minPrice) {
        minPrice = price;
        cheapestSelected = c;
      }
    });

    const isNewToggle = nextAmounts[activeCode] === "";

    if ((activeCode !== cheapestSelected || isNewToggle) && nextAmounts[cheapestSelected] !== undefined) {
      let sumOthers = 0;
      Object.entries(nextAmounts).forEach(([k, v]) => {
        if (k !== cheapestSelected) {
          sumOthers += parseFloat(v) || 0;
        }
      });
      
      const numericC = parseFloat(consumption) || 0;
      const cFuel = Math.round(((totalDistance / 100) * numericC) * FUEL_BUFFER_RATIO);
      
      const newCheapestAmount = Math.max(0, cFuel - sumOthers);
      nextAmounts[cheapestSelected] = (Math.round(newCheapestAmount * 10) / 10).toString();
    }

    // Final validation to prevent exceeding total calculated fuel
    let finalSum = 0;
    Object.values(nextAmounts).forEach(v => finalSum += parseFloat(v) || 0);
    
    const numericC = parseFloat(consumption) || 0;
    const cFuel = Math.round(((totalDistance / 100) * numericC) * FUEL_BUFFER_RATIO);
    
    if (finalSum > cFuel + 0.1) {
      // Revert the excess from the activeCode that caused it
      let sumWithoutActive = 0;
      Object.entries(nextAmounts).forEach(([k, v]) => {
        if (k !== activeCode) sumWithoutActive += parseFloat(v) || 0;
      });
      
      const maxAllowed = Math.max(0, cFuel - sumWithoutActive);
      nextAmounts[activeCode] = (Math.round(maxAllowed * 10) / 10).toString();
      
      // Throttle toast to once every 3 seconds
      const now = Date.now();
      if (now - lastToastTime.current > 3000) {
        lastToastTime.current = now;
        // Dynamic import to avoid SSR issues
        import('izitoast').then((module) => {
          const iziToast = module.default;
          iziToast.warning({
            title: 'Увага',
            message: 'Неможливо додати палива більше, ніж потрібно для маршруту',
            position: 'topRight',
            timeout: 3000
          });
        });
      }
    }

    return nextAmounts;
  };

  const toggleCountry = (code: string) => {
    setFuelAmounts((prev) => {
      const next = { ...prev };
      if (next[code] !== undefined) {
        delete next[code];
      } else {
        next[code] = "";
      }
      return balanceFuel(next, code);
    });
  };

  const updateAmount = (code: string, amount: string) => {
    setFuelAmounts((prev) => {
      const next = { ...prev, [code]: amount };
      return balanceFuel(next, code);
    });
  };

  // Calculations
  const numericConsumption = parseFloat(consumption) || 0;
  const totalFuel = (totalDistance / 100) * numericConsumption;
  const conservativeFuel = Math.round(totalFuel * FUEL_BUFFER_RATIO); // buffer, rounded

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
    <div className="flex-1 flex flex-col space-y-4">
      <div className="pb-4 border-b border-white/10 flex justify-end">
        <Select value={currency} onValueChange={(v) => { if (v) setCurrency(v); }}>
          <SelectTrigger className="w-24 h-10 text-xs">
            <SelectValue placeholder="Валюта" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EUR">EUR (€)</SelectItem>
            <SelectItem value="UAH">UAH (₴)</SelectItem>
            <SelectItem value="USD">USD ($)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="pt-2 space-y-6">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Тип палива</Label>
            <Select value={selectedFuelType} onValueChange={(v) => { 
              if (v) {
                setFuelType(v as FuelType); 
                const defaultC = v === 'gasoline' ? '8' : v === 'diesel' ? '6' : '10';
                setConsumption(defaultC, true);
                setFuelAmounts({});
                setTimeout(() => useTripStore.getState().autoAssignFuel(), 0);
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
            <div className="relative w-36">
              <Input 
                type="text"
                inputMode="decimal"
                placeholder={selectedFuelType === 'gasoline' ? '8.0' : selectedFuelType === 'diesel' ? '6.0' : '10.0'}
                value={consumption}
                onFocus={() => {
                  setIsFocused(true);
                  if (isDefaultConsumption) {
                    setConsumption("", false);
                    setFuelAmounts({});
                  }
                }}
                onBlur={() => {
                  setIsFocused(false);
                  if (!consumption) {
                    const defaultC = selectedFuelType === 'gasoline' ? '8' : selectedFuelType === 'diesel' ? '6' : '10';
                    setConsumption(defaultC, true);
                  }
                }}
                onChange={(e) => {
                  const val = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
                  setConsumption(val, false);
                }}
                className={`pr-20 text-right font-medium ${isDefaultConsumption && !isFocused ? 'text-white/50 bg-white/5' : ''}`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/40 pointer-events-none">л/100 км</span>
            </div>
          </div>
        </div>

        {crossedCountries.length > 0 && (
          <div className="space-y-4">
             <Label>Країни для заправки (натисніть, щоб додати об'єм)</Label>
             <div className="flex flex-wrap gap-2">
                {crossedCountries.map(code => {
                  let countryName = code;
                  try {
                    countryName = regionNames.of(code) || code;
                  } catch (e) {
                    // Ignore error for invalid codes like "UNKNOWN"
                  }
                  const priceEur = fuelPrices[code]?.[selectedFuelType];
                  const isSelected = fuelAmounts[code] !== undefined;
                  const priceLocal = priceEur ? (priceEur * rate).toFixed(2) : null;
                  
                  return (
                    <button
                      key={code}
                      onClick={() => toggleCountry(code)}
                      className={`px-3 py-1.5 text-sm rounded-xl border transition-colors ${
                        isSelected 
                          ? 'bg-white/20 text-white border-white/30' 
                          : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
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
                      <div key={code}>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <Label className="text-xs text-white/50 mb-1 block">
                              {countryName} ({currencySymbol}{priceLocal.toFixed(2)}/л)
                            </Label>
                            <div className="relative">
                              <Input 
                                type="text"
                                inputMode="decimal"
                                value={amount}
                                onFocus={() => setIsAnyAmountFocused(true)}
                                onBlur={() => setIsAnyAmountFocused(false)}
                                onChange={(e) => updateAmount(code, e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))}
                                className={`pr-8 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${isDefaultConsumption && !isFocused && !isAnyAmountFocused ? 'opacity-40 text-white/50 bg-white/5 transition-opacity' : 'opacity-100 transition-opacity'}`}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/40">л</span>
                            </div>
                          </div>
                          <div className="w-24 text-right pt-5 text-sm font-medium text-white/90">
                            {currencySymbol} {countryCostLocal}
                          </div>
                        </div>

                      </div>
                    );
                 })}
               </div>
             )}
          </div>
        )}

        <div className="rounded-xl bg-white/5 p-4 space-y-3 border border-white/10">
          <div className="flex justify-between text-sm">
            <span className="text-white/60 flex items-center gap-1">
              Кількість палива:
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger 
                    onClick={(e) => {
                      e.preventDefault();
                      import('izitoast').then((module) => {
                        module.default.info({
                          title: 'Кількість палива',
                          message: 'Включає 10% запасу для більш надійного розрахунку',
                          position: 'topCenter',
                          timeout: 3000
                        });
                      });
                    }}
                  >
                    <Info className="w-4 h-4 text-white/40 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Включає 10% запасу для більш надійного розрахунку</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <span className="font-semibold text-white/90">{Math.round(conservativeFuel)} л</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-white/60">Всього розподілено:</span>
            <span className="font-semibold text-white/90">{Math.round(distributedFuel)} л</span>
          </div>

          {isWarning && (
            <div className="flex justify-between text-sm text-red-400 bg-red-400/10 p-2 rounded-lg border border-red-400/20">
              <span>Залишилось розподілити:</span>
              <span className="font-semibold">{Math.round(remainingFuel)} л</span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold pt-3 border-t border-white/10 mt-2">
            <span className="text-white/80">Орієнтовна вартість:</span>
            <span className="text-white">{currencySymbol} {totalCostLocal}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
