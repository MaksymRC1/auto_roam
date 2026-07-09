"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation2, CheckCircle2, AlertCircle, Map as MapIcon, List } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTripStore, PanelType } from "@/store/useTripStore";
import { MapPanel } from "./panels/map-panel";
import { FuelPanel } from "./panels/fuel-panel";
import { HotelPanel } from "./panels/hotel-panel";
import { BordersPanel } from "./panels/borders-panel";
import { BudgetPanel } from "./panels/budget-panel";
import { StopsInput } from "./stops-input";
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
    totalDistance, 
    totalDuration, 
    waypoints, 
    activePanel, 
    setActivePanel,
    fuelPrices, selectedFuelType, fuelAmounts, currency, exchangeRates, crossedCountries
  } = useTripStore();

  const rate = exchangeRates[currency] || 1;
  const currencySymbol = currency === "EUR" ? "€" : currency === "UAH" ? "₴" : currency === "USD" ? "$" : "zł";

  let totalCostEur = 0;
  Object.entries(fuelAmounts).forEach(([code, amountStr]) => {
    const amount = parseFloat(amountStr) || 0;
    const priceEur = fuelPrices[code]?.[selectedFuelType] || 0;
    totalCostEur += amount * priceEur;
  });
  const totalFuelCost = Math.round(totalCostEur * rate);

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
    <div className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
      
      {/* Mobile Input */}
      <Card className="p-4 mb-6 md:hidden">
        <StopsInput />
      </Card>

      {/* Main Layout */}
      <div className="flex flex-col-reverse md:flex-row gap-6 lg:gap-8 h-auto md:h-[calc(100vh-140px)]">
        
        {/* LEFT PANEL: Trip Timeline & Map Toggle */}
        <div className="w-full md:w-[400px] lg:w-[480px] flex flex-col h-full gap-4">
          
          {/* Toggle Tabs */}
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

          <Card className="flex-1 overflow-hidden flex flex-col relative border-slate-200 shadow-sm">
            {leftView === 'map' ? (
              <MapPanel />
            ) : (
              <>
                {!isCalculated && (
                  <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                    <List className="w-12 h-12 text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">Маршрут поки не побудовано.</p>
                    <p className="text-sm text-slate-400 mt-2">Введіть дані праворуч, щоб побачити таймлайн подорожі.</p>
                  </div>
                )}
                
                <div className="p-5 border-b bg-white">
                  <h2 className="font-bold text-lg text-slate-800">Trip Timeline</h2>
                  {isCalculated && (
                    <p className="text-sm font-medium text-blue-600 mt-1">
                      {totalDistance} км • ~{formatTime(totalDuration)}
                    </p>
                  )}
                </div>
                
                <div className="flex-1 p-5 bg-slate-50/50 overflow-y-auto">
                  <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
                    
                    {waypoints.map((wp) => {
                      const isStart = wp.type === 'start';
                      const isFinish = wp.type === 'finish';
                      const isFuel = wp.type === 'fuel';
                      const isBorder = wp.type === 'border';
                      
                      return (
                        <div key={wp.id} className="relative flex items-center justify-between group">
                          <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 border-white shadow-sm shrink-0 absolute -left-3 ${
                            isStart ? 'bg-emerald-500' : 
                            isFinish ? 'bg-rose-500' : 
                            isFuel ? 'bg-blue-500' :
                            isBorder ? 'bg-amber-500' : 'bg-slate-500'
                          }`}>
                            {isStart || isFinish ? (
                              <MapPin className="w-3 h-3 text-white" />
                            ) : isFuel ? (
                              <span className="text-[10px]">⛽</span>
                            ) : isBorder ? (
                              <span className="text-[10px]">🛂</span>
                            ) : (
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            )}
                          </div>
                          
                          <div className="w-[calc(100%-2rem)] bg-white p-3 rounded-lg border shadow-sm group-hover:border-blue-200 transition-colors">
                            <div className="flex flex-col">
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
                              {wp.lat && wp.lon && (
                                <div className="flex gap-2 mt-2 pt-2 border-t border-slate-50">
                                  <a href={`https://waze.com/ul?ll=${wp.lat},${wp.lon}&navigate=yes`} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 font-medium flex items-center gap-1 transition-colors">
                                    <Navigation2 className="w-3 h-3" /> Waze
                                  </a>
                                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${wp.lat},${wp.lon}&travelmode=driving`} target="_blank" rel="noreferrer" className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-100 font-medium flex items-center gap-1 transition-colors">
                                    <MapPin className="w-3 h-3" /> Maps
                                  </a>
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
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 pb-10 md:pb-0">
          
          {/* Desktop Input */}
          <Card className="hidden md:block p-5 border-slate-200 shadow-sm shrink-0 bg-white">
            <h3 className="font-semibold text-slate-800 mb-4">Параметри маршруту</h3>
            <StopsInput />
          </Card>

          {/* Smart Panels Accordion List */}
          {isCalculated && (
            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm">
              <Accordion 
                value={activePanel ? [activePanel] : []} 
                onValueChange={(v: any) => { 
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
                          {totalDistance} км • {totalFuelCost > 0 ? `${currencySymbol} ${totalFuelCost}` : 'Не розподілено'}
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
  );
}
