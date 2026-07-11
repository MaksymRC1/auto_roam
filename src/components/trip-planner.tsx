"use client";

import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation2, CheckCircle2, Map as MapIcon, List, Trash2 } from "lucide-react";
import { useTripStore, PanelType } from "@/store/useTripStore";
import { MapPanel } from "./panels/map-panel";
import { LeftPlaceholder } from "./left-placeholder";
import { BackgroundSlideshow } from "./background-slideshow";
import { FuelPanel } from "./panels/fuel-panel";
import { HotelPanel } from "./panels/hotel-panel";
import { BordersPanel } from "./panels/borders-panel";
import { BudgetPanel } from "./panels/budget-panel";
import { StopsInput } from "./stops-input";
import { getBorderCrossings, isSchengenPair } from "@/lib/borders";
import { getCurrencySymbol } from "@/lib/constants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TripPlanner() {
  const [mounted, setMounted] = useState(false);
  const [leftView, setLeftView] = useState<'timeline' | 'map'>('timeline');
  const { 
    isCalculated, 
    isLoading,
    totalDistance, 
    totalDuration, 
    waypoints, 
    activePanel, 
    setActivePanel,
    fuelPrices, selectedFuelType, fuelAmounts, currency, exchangeRates, crossedCountries,
    insertBorderStop, hotelOverrides, setHotelOverride,
    ignoredWaypoints, ignoreWaypoint, removeStop, calculateRoute
  } = useTripStore();

  const rate = exchangeRates[currency] || 1;
  const currencySymbol = getCurrencySymbol(currency);

  // Task 2.3: useMemo for fuel cost calculation
  const totalFuelCost = useMemo(() => {
    let totalCostEur = 0;
    Object.entries(fuelAmounts).forEach(([code, amountStr]) => {
      const amount = parseFloat(amountStr) || 0;
      const priceEur = fuelPrices[code]?.[selectedFuelType] || 0;
      totalCostEur += amount * priceEur;
    });
    return Math.round(totalCostEur * rate);
  }, [fuelAmounts, fuelPrices, selectedFuelType, rate]);

  const needsFuel = totalDistance > 0 && totalFuelCost === 0;
  const needsHotel = totalDuration > 480;
  const needsBorders = crossedCountries.length > 1;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h} год ${m > 0 ? m + ' хв' : ''}`;
  };

  return (
    <>
      {!isCalculated && (
        <div className="fixed inset-0 top-14 z-0 pointer-events-none" aria-hidden="true">
          <BackgroundSlideshow />
        </div>
      )}
      <div className={`max-w-7xl mx-auto w-full flex-1 flex flex-col relative p-4 md:p-6 lg:p-8 z-10 ${!isCalculated ? 'justify-center items-center' : ''}`}>
        {isLoading && (
          <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[9999] flex items-center justify-center" role="status" aria-label="Завантаження">
            <div className="loader"></div>
          </div>
        )}

      {/* Mobile Input */}
      <Card className="p-4 mb-6 md:hidden">
        <StopsInput />
      </Card>

      {/* Main Layout */}
      <div className={`flex flex-col md:flex-row gap-6 lg:gap-8 w-full flex-1 pb-8 ${!isCalculated ? 'items-stretch justify-center max-w-6xl' : ''}`}>
        
        {/* LEFT PANEL: Trip Timeline & Map Toggle */}
        <div className={`w-full md:w-1/2 flex flex-col ${!isCalculated ? '' : 'gap-4'}`}>
          
          {/* Toggle Tabs - Only show when calculated */}
          {isCalculated && (
            <Tabs value={leftView} onValueChange={(v) => setLeftView(v as 'timeline' | 'map')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="timeline" className="flex items-center gap-2">
                  <List className="w-4 h-4" /> Таймлайн
                </TabsTrigger>
                <TabsTrigger value="map" className="flex items-center gap-2">
                  <MapIcon className="w-4 h-4" /> Карта
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <Card className={`flex-1 overflow-hidden flex flex-col relative border-slate-200 shadow-sm ${!isCalculated ? 'p-6 sm:p-8 rounded-2xl border-white/60 shadow-2xl bg-white/95 backdrop-blur-md min-h-[450px]' : ''}`}>
            {leftView === 'map' ? (
              <MapPanel />
            ) : (
              <>
                {!isCalculated && (
                  <LeftPlaceholder />
                )}
                {isCalculated && (
                  <div className="p-5 border-b bg-white">
                    <h2 className="font-bold text-lg text-slate-800">Trip Timeline</h2>
                    <p className="text-sm font-medium text-blue-600 mt-1">
                      {totalDistance} км • ~{formatTime(totalDuration)}
                    </p>
                  </div>
                )}
                
                <div className="flex-1 p-5 bg-slate-50/50 overflow-y-auto">
                  <div className="relative space-y-8 before:absolute before:inset-0 before:left-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200" role="list" aria-label="Хронологія маршруту">
                    
                    {waypoints.filter(wp => !ignoredWaypoints.includes(wp.id)).map((wp) => {
                      const isStart = wp.type === 'start';
                      const isFinish = wp.type === 'finish';
                      const isFuel = wp.type === 'fuel';
                      const isBorder = wp.type === 'border';
                      const isHotel = wp.id.startsWith('hotel-');
                      
                      return (
                        <div key={wp.id} className="relative flex items-start group" role="listitem">
                          <div className={`flex items-center justify-center w-6 h-6 mt-1.5 rounded-full border-2 border-white shadow-sm shrink-0 z-10 ${
                            isStart ? 'bg-emerald-500' : 
                            isFinish ? 'bg-rose-500' : 
                            isFuel ? 'bg-blue-500' :
                            isBorder ? 'bg-amber-500' : 'bg-slate-500'
                          }`}>
                            {isStart || isFinish ? (
                              <MapPin className="w-3 h-3 text-white" />
                            ) : isFuel ? (
                              <span className="text-sm">⛽</span>
                            ) : isBorder ? (
                              <span className="text-sm">🛂</span>
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            )}
                          </div>
                          
                          <div className="flex-1 ml-4 bg-white p-3 rounded-lg border shadow-sm group-hover:border-blue-200 transition-colors relative">
                            {!isStart && !isFinish && !isFuel && (
                              <button 
                                onClick={() => {
                                  if (isBorder || isHotel) {
                                    ignoreWaypoint(wp.id);
                                  } else {
                                    removeStop(wp.id);
                                    calculateRoute();
                                  }
                                }}
                                className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100 z-10"
                                title="Видалити з таймлайну"
                                aria-label="Видалити з таймлайну"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                            <div className="flex flex-col pr-6">
                              <span className={`text-sm ${isStart || isFinish ? 'font-bold text-slate-800' : 'font-semibold text-slate-700'}`}>
                                {wp.name}
                              </span>
                              {!isStart && (
                                <span className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                  через {wp.distanceFromStart} км <span className="text-slate-300">•</span> {formatTime(wp.timeFromStart)}
                                </span>
                              )}
                              {isStart && (
                                <span className="text-xs text-emerald-600 font-medium mt-1">Точка відправлення</span>
                              )}
                              {wp.lat && wp.lon && !isHotel && (
                                <div className="flex gap-2 mt-2 pt-2 border-t border-slate-50">
                                  <a href={`https://waze.com/ul?ll=${wp.lat},${wp.lon}&navigate=yes`} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 font-medium flex items-center gap-1 transition-colors">
                                    <Navigation2 className="w-3 h-3" /> Waze
                                  </a>
                                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${wp.lat},${wp.lon}&travelmode=driving`} target="_blank" rel="noreferrer" className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-100 font-medium flex items-center gap-1 transition-colors">
                                    <MapPin className="w-3 h-3" /> Maps
                                  </a>
                                </div>
                              )}

                              {isHotel && (
                                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
                                  <div className="flex flex-col sm:flex-row gap-2">
                                    <input 
                                      type="text" 
                                      placeholder="🔗 Вставте посилання на готель (Booking, Maps)..." 
                                      className="flex-1 text-xs p-2 border rounded border-slate-200 text-slate-700 bg-slate-50 hover:border-amber-300 focus:border-amber-500 focus:bg-white outline-none transition-colors"
                                      defaultValue={hotelOverrides[wp.id]?.url || ''}
                                      onBlur={(e) => {
                                        if(e.target.value) {
                                           setHotelOverride(wp.id, { url: e.target.value });
                                        }
                                      }}
                                    />
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-slate-500 whitespace-nowrap">Ціна:</span>
                                      <input 
                                        type="number" 
                                        placeholder="EUR" 
                                        className="w-20 sm:w-24 text-xs p-2 border rounded border-slate-200 text-slate-700 bg-slate-50 hover:border-amber-300 focus:border-amber-500 focus:bg-white outline-none transition-colors"
                                        defaultValue={hotelOverrides[wp.id]?.priceEur || ''}
                                        onBlur={(e) => {
                                          if(e.target.value) {
                                             setHotelOverride(wp.id, { priceEur: Number(e.target.value) });
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Task 2.5: Schengen label */}
                              {isBorder && wp.fromCountry && wp.toCountry && isSchengenPair(wp.fromCountry, wp.toCountry) && (
                                <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1">
                                  🇪🇺 Шенгенська зона — без контролю
                                </span>
                              )}

                              {isBorder && wp.fromCountry && wp.toCountry && (
                                <div className="mt-2">
                                  <select 
                                    className="w-full text-xs p-2 border rounded border-slate-200 text-slate-700 bg-slate-50 hover:border-blue-300 focus:border-blue-500 outline-none cursor-pointer"
                                    onChange={(e) => {
                                      const crossings = getBorderCrossings(wp.fromCountry!, wp.toCountry!);
                                      const selected = crossings.find(c => c.id === e.target.value);
                                      if (selected) {
                                        insertBorderStop(selected, wp.distanceFromStart);
                                      }
                                    }}
                                    defaultValue=""
                                    aria-label={`Змінити пункт пропуску ${wp.fromCountry} → ${wp.toCountry}`}
                                  >
                                    <option value="" disabled>Змінити пункт пропуску</option>
                                    {getBorderCrossings(wp.fromCountry, wp.toCountry).map(c => (
                                      <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  </div>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* RIGHT PANEL: Input & Accordion Submenus */}
        <div className={`relative w-full md:w-1/2 flex flex-col pr-2 pb-10 md:pb-0 transition-all duration-500 ease-in-out ${!isCalculated ? 'justify-center' : 'gap-4 overflow-y-auto'}`}>
          
          {/* Desktop Input */}
          <Card className={`relative z-10 hidden md:flex flex-col p-5 border-slate-200 shadow-sm shrink-0 bg-white ${!isCalculated ? 'flex-1 p-6 sm:p-8 rounded-2xl border-white/60 shadow-2xl bg-white/95 backdrop-blur-md justify-center min-h-[450px]' : ''}`}>
            {!isCalculated && <h3 className="font-bold text-2xl text-slate-800 mb-6 text-center drop-shadow-sm">Побудувати маршрут</h3>}
            {isCalculated && <h3 className="font-semibold text-slate-800 mb-4">Параметри маршруту</h3>}
            <StopsInput />
          </Card>

          {/* Smart Panels Accordion List */}
          {isCalculated && (
            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm">
              <Accordion 
                value={activePanel ? [activePanel] : []} 
                onValueChange={(v: string | string[]) => { 
                  if (Array.isArray(v)) {
                    setActivePanel(v.length > 0 ? (v[0] as PanelType) : null);
                  } else {
                    setActivePanel(v ? (v as PanelType) : null);
                  }
                }}
                className="w-full"
              >
                
                <AccordionItem value="fuel" className="border-b px-2">
                  <AccordionTrigger className="hover:no-underline px-4 py-4 data-[state=open]:text-blue-600">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pr-4 gap-1 text-left">
                      <div className="flex items-center gap-3 text-base">
                        <span className="text-xl">⛽</span> <span className="font-semibold">Розрахунок палива</span>
                        {needsFuel && (
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Потребує уваги"></span>
                        )}
                      </div>
                      {totalDistance > 0 && (
                        <span className="text-sm font-normal text-slate-500 bg-slate-50 border px-2 py-0.5 rounded-full ml-8 sm:ml-0 w-fit">
                          {totalDistance} км {totalFuelCost > 0 ? `• ${currencySymbol} ${totalFuelCost}` : ''}
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <FuelPanel />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="hotel" className="border-b px-2">
                  <AccordionTrigger className="hover:no-underline px-4 py-4 data-[state=open]:text-blue-600">
                    <div className="flex items-center gap-3 text-base">
                      <span className="text-xl">🏨</span> <span className="font-semibold">Ночівля та зупинки</span>
                      {needsHotel && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Потребує уваги"></span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <HotelPanel />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="borders" className="border-b px-2">
                  <AccordionTrigger className="hover:no-underline px-4 py-4 data-[state=open]:text-blue-600">
                    <div className="flex items-center gap-3 text-base">
                      <span className="text-xl">🛂</span> <span className="font-semibold">Кордони та віньєтки</span>
                      {needsBorders && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Потребує уваги"></span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <BordersPanel />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="budget" className="px-2 border-none">
                  <AccordionTrigger className="hover:no-underline px-4 py-4 data-[state=open]:text-blue-600">
                    <div className="flex items-center gap-3 text-base">
                      <span className="text-xl">💰</span> <span className="font-semibold">Загальний кошторис</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <BudgetPanel />
                  </AccordionContent>
                </AccordionItem>

              </Accordion>
            </div>
          )}
          
        </div>

      </div>
      </div>
      
      {/* Footer */}
      <footer className="w-full bg-white pt-8 pb-6 text-center border-t border-slate-200 relative z-10 mt-auto">
        <p className="text-slate-500 font-medium text-sm">AutoRoam Planner &copy; {new Date().getFullYear()}</p>
        <p className="text-slate-400 text-xs mt-1">Дані про маршрути надані OSRM. Створено для найкращих автоподорожей.</p>
      </footer>
    </>
  );
}
