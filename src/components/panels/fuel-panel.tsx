"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Pencil } from "lucide-react";
import 'izitoast/dist/css/iziToast.min.css';


import { useTripStore, FuelType, getEffectiveFuelPrice } from "@/store/useTripStore";
import { FUEL_BUFFER_RATIO, getCurrencySymbol } from "@/lib/constants";
import { useTranslations } from 'next-intl';

export function FuelPanel() {
  const { 
    totalDistance, fuelPrices, customFuelPrices, setCustomFuelPrice, fetchFuelPrices, selectedFuelType, setFuelType, crossedCountries,
    consumption, setConsumption, isDefaultConsumption, fuelAmounts, setFuelAmounts, currency, setCurrency, exchangeRates, setExchangeRates
  } = useTripStore();
  const t = useTranslations('Fuel');
  
  const [isFocused, setIsFocused] = useState(false);
  const [isAnyAmountFocused, setIsAnyAmountFocused] = useState(false);


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

    const numericC = parseFloat(consumption) || 0;
    const cFuel = Math.round(((totalDistance / 100) * numericC) * FUEL_BUFFER_RATIO);

    // Parse all amounts, cap active code at cFuel if it exceeds
    let activeVal = parseFloat(nextAmounts[activeCode]) || 0;
    if (activeVal > cFuel) {
      activeVal = cFuel;
      nextAmounts[activeCode] = activeVal.toString();
    }

    let sum = 0;
    const amounts: Record<string, number> = {};
    selectedCountries.forEach(c => {
      const v = parseFloat(nextAmounts[c]) || 0;
      amounts[c] = v;
      sum += v;
    });

    if (Math.abs(sum - cFuel) < 0.1) {
      return nextAmounts; // already balanced
    }

    const otherCountries = selectedCountries.filter(c => c !== activeCode);

    if (sum > cFuel) {
      // Need to reduce other countries. Start with the most expensive.
      let excess = sum - cFuel;
      const sortedOthersDesc = [...otherCountries].sort((a, b) => {
        const priceA = getEffectiveFuelPrice(a, fuelPrices, selectedFuelType, customFuelPrices);
        const priceB = getEffectiveFuelPrice(b, fuelPrices, selectedFuelType, customFuelPrices);
        return priceB - priceA;
      });

      for (const c of sortedOthersDesc) {
        if (excess <= 0) break;
        const v = amounts[c];
        if (v > 0) {
          const reduction = Math.min(v, excess);
          amounts[c] -= reduction;
          excess -= reduction;
        }
      }
    } else {
      // Need to increase other countries. Give all deficit to the cheapest.
      const deficit = cFuel - sum;
      if (otherCountries.length > 0) {
        const sortedOthersAsc = [...otherCountries].sort((a, b) => {
          const priceA = getEffectiveFuelPrice(a, fuelPrices, selectedFuelType, customFuelPrices);
          const priceB = getEffectiveFuelPrice(b, fuelPrices, selectedFuelType, customFuelPrices);
          return priceA - priceB;
        });
        const cheapest = sortedOthersAsc[0];
        amounts[cheapest] += deficit;
      } else {
        // If there's only one country, give it all
        amounts[activeCode] = cFuel;
      }
    }

    // Convert back to strings with 1 decimal place max
    selectedCountries.forEach(c => {
      nextAmounts[c] = (Math.round(amounts[c] * 10) / 10).toString();
    });

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
    const priceEur = getEffectiveFuelPrice(code, fuelPrices, selectedFuelType, customFuelPrices);
    distributedFuel += amount;
    totalCostEur += amount * priceEur;
  });

  const remainingFuel = Math.max(0, conservativeFuel - distributedFuel);
  const isWarning = remainingFuel > 0.1;

  const totalCostLocal = Math.round(totalCostEur * rate);

  return (
    <div className="flex-1 flex flex-col space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <span className="text-sm font-medium text-white/80">{t('calcCurrency')}</span>
        <Select value={currency} onValueChange={(v) => { if (v) setCurrency(v); }}>
          <SelectTrigger className="w-24 h-10 text-xs bg-white/5 border-white/10">
            <SelectValue placeholder={t('calcCurrency')} />
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
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-white/80 whitespace-nowrap">{t('fuelType')}</Label>
            <Select value={selectedFuelType} onValueChange={(v) => { 
              if (v) {
                setFuelType(v as FuelType); 
                const defaultC = v === 'gasoline' ? '8' : v === 'diesel' ? '6' : '10';
                setConsumption(defaultC, true);
                setFuelAmounts({});
                setTimeout(() => useTripStore.getState().autoAssignFuel(), 0);
              }
            }}>
              <SelectTrigger className="w-full h-11 bg-white/5 border-white/10 text-sm">
                <SelectValue placeholder={t('fuelType')}>
                  {selectedFuelType === 'gasoline' ? t('types.gasoline') : selectedFuelType === 'gasoline_premium' ? t('types.gasoline_premium') : selectedFuelType === 'diesel' ? t('types.diesel') : selectedFuelType === 'diesel_premium' ? t('types.diesel_premium') : t('types.lpg')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gasoline">{t('types.gasoline')}</SelectItem>
                <SelectItem value="gasoline_premium">{t('types.gasoline_premium')}</SelectItem>
                <SelectItem value="diesel">{t('types.diesel')}</SelectItem>
                <SelectItem value="diesel_premium">{t('types.diesel_premium')}</SelectItem>
                <SelectItem value="lpg">{t('types.lpg')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-white/80 whitespace-nowrap">{t('consumptionLabel')}</Label>
            <div className="relative w-full">
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
                className={`w-full h-11 pr-[72px] text-right font-medium text-sm ${isDefaultConsumption && !isFocused ? 'text-white/50 bg-white/5' : ''}`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/40 pointer-events-none">{t('litersPer100km')}</span>
            </div>
          </div>
        </div>

        {crossedCountries.length > 0 && (
          <div className="space-y-4">
             <Label>{t('countriesToRefuel')}</Label>
             <div className="flex flex-wrap gap-2">
                {crossedCountries.map(code => {
                  let countryName = code;
                  try {
                    countryName = regionNames.of(code) || code;
                  } catch (e) {
                    // Ignore error for invalid codes like "UNKNOWN"
                  }
                  const priceEur = getEffectiveFuelPrice(code, fuelPrices, selectedFuelType, customFuelPrices);
                  const isSelected = fuelAmounts[code] !== undefined;
                  const priceLocal = priceEur > 0 ? (priceEur * rate).toFixed(2) : null;
                  
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
                     const priceEur = getEffectiveFuelPrice(code, fuelPrices, selectedFuelType, customFuelPrices);
                     const priceLocal = priceEur * rate;
                     const countryCostLocal = Math.round((parseFloat(amount) || 0) * priceLocal);

                     return (
                       <div key={code}>
                         <div className="flex items-center gap-3">
                           <div className="flex-1">
                             <div className="flex items-center justify-between gap-2 mb-1">
                                <Label className="text-xs text-white/70 truncate">
                                  {countryName}
                                </Label>
                                <div className="flex items-center gap-1 text-xs text-white/50 shrink-0 whitespace-nowrap">
                                  <span>{currencySymbol}</span>
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    value={priceLocal > 0 ? priceLocal.toFixed(2) : ''}
                                    placeholder="0.00"
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value.replace(',', '.'));
                                      if (!isNaN(val) && val > 0) {
                                        setCustomFuelPrice(code, selectedFuelType, Number((val / rate).toFixed(4)));
                                      } else if (e.target.value === '' || val <= 0) {
                                        setCustomFuelPrice(code, selectedFuelType, 0);
                                      }
                                    }}
                                    className="w-14 bg-white/10 border border-white/20 rounded px-1.5 py-0.5 text-xs text-white text-right focus:outline-none focus:border-emerald-400"
                                    title={t('clickToChangePrice')}
                                  />
                                  <span className="inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
                                    <span>{t('perLiter')}</span>
                                    <Pencil className="w-3 h-3 text-white/40 shrink-0" />
                                  </span>
                                </div>
                              </div>
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
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/40">{t('litersShort')}</span>
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
              {t('fuelAmount')}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger 
                    onClick={(e) => {
                      e.preventDefault();
                      import('izitoast').then((module) => {
                        module.default.info({
                          title: t('fuelAmount').replace(':', ''),
                          message: t('reserveNotice'),
                          position: 'topCenter',
                          timeout: 3000
                        });
                      });
                    }}
                  >
                    <Info className="w-4 h-4 text-white/40 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('reserveNotice')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <span className="font-semibold text-white/90">{Math.round(conservativeFuel)} {t('litersShort')}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-white/60">{t('totalDistributed')}</span>
            <span className="font-semibold text-white/90">{Math.round(distributedFuel)} {t('litersShort')}</span>
          </div>

          {isWarning && (
            <div className="flex justify-between text-sm text-red-400 bg-red-400/10 p-2 rounded-lg border border-red-400/20">
              <span>{t('remainingToDistribute')}</span>
              <span className="font-semibold">{Math.round(remainingFuel)} {t('litersShort')}</span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold pt-3 border-t border-white/10 mt-2">
            <span className="text-white/80">{t('estimatedCost')}</span>
            <span className="text-white">{currencySymbol} {totalCostLocal}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
