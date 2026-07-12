"use client";

import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation2, CheckCircle2, Map as MapIcon, List, Trash2 } from "lucide-react";
import { useTripStore, PanelType } from "@/store/useTripStore";
import { MapPanel } from "./panels/map-panel";
import { LeftPlaceholder } from "./left-placeholder";
import { FuelPanel } from "./panels/fuel-panel";
import { HotelPanel } from "./panels/hotel-panel";
import { BordersPanel } from "./panels/borders-panel";
import { InsurancePanel } from "./panels/insurance-panel";
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
      {isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center" role="status" aria-label="Завантаження">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!isCalculated ? (
        <div className="flex-grow flex items-center justify-center pt-24 pb-32 px-4 md:px-8 min-h-screen">
          <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-stretch">
            <LeftPlaceholder />
            <div className="rounded-[20px] p-6 md:p-8 shadow-2xl relative overflow-hidden" style={{ background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(16px)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-8 relative z-10">Побудувати маршрут</h2>
              <div className="relative z-10">
                <StopsInput />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-[1280px] mx-auto w-full flex-1 flex flex-col relative pt-24 pb-32 px-4 md:px-8 z-10">
          <div className="flex flex-col md:flex-row gap-6 lg:gap-8 w-full flex-1 pb-8">
            
            {/* LEFT PANEL: Trip Timeline & Map Toggle */}
            <div className="w-full md:w-1/2 flex flex-col gap-4">
              
              {/* Toggle Tabs */}
              <Tabs value={leftView} onValueChange={(v) => setLeftView(v as 'timeline' | 'map')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-white/10 text-white">
                  <TabsTrigger value="timeline" className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
                    <List className="w-4 h-4" /> Таймлайн
                  </TabsTrigger>
                  <TabsTrigger value="map" className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
                    <MapIcon className="w-4 h-4" /> Карта
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Card className="flex-1 overflow-hidden flex flex-col relative bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl text-white">
                {leftView === 'map' ? (
                  <MapPanel />
                ) : (
                  <>
                    <div className="p-5 border-b border-white/10 bg-black/20">
                      <h2 className="font-bold text-lg text-white">Хронологія подорожі</h2>
                      <p className="text-sm font-medium text-blue-300 mt-1">
                        {totalDistance} км • ~{formatTime(totalDuration)}
                      </p>
                    </div>
                    
                    <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
                      <div className="relative space-y-8 before:absolute before:inset-0 before:left-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-white/20" role="list" aria-label="Хронологія маршруту">
                        
                        {waypoints.filter(wp => !ignoredWaypoints.includes(wp.id)).map((wp) => {
                          const isStart = wp.type === 'start';
                          const isFinish = wp.type === 'finish';
                          const isFuel = wp.type === 'fuel';
                          const isBorder = wp.type === 'border';
                          const isHotel = wp.id.startsWith('hotel-');
                          
                          return (
                            <div key={wp.id} className="relative flex items-start group" role="listitem">
                              <div className={`flex items-center justify-center w-6 h-6 mt-1.5 rounded-full border-2 border-slate-900 shadow-sm shrink-0 z-10 ${
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
                              
                              <div className="flex-1 ml-4 bg-white/10 backdrop-blur-md p-3 rounded-lg border border-white/10 shadow-sm group-hover:border-white/30 transition-colors relative">
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
                                    className="absolute top-2 right-2 p-1.5 text-white/50 hover:text-red-400 hover:bg-red-900/30 rounded transition-colors opacity-0 group-hover:opacity-100 z-10"
                                    title="Видалити з таймлайну"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                                <div className="flex flex-col pr-6">
                                  <span className={`text-sm ${isStart || isFinish ? 'font-bold text-white' : 'font-semibold text-white/90'}`}>
                                    {wp.name}
                                  </span>
                                  {!isStart && (
                                    <span className="text-xs text-white/60 mt-1 flex items-center gap-1">
                                      через {wp.distanceFromStart} км <span className="text-white/30">•</span> {formatTime(wp.timeFromStart)}
                                    </span>
                                  )}
                                  {isStart && (
                                    <span className="text-xs text-emerald-400 font-medium mt-1">Точка відправлення</span>
                                  )}
                                  {wp.lat && wp.lon && !isHotel && (
                                    <div className="flex gap-2 mt-2 pt-2 border-t border-white/10">
                                      <a href={`https://waze.com/ul?ll=${wp.lat},${wp.lon}&navigate=yes`} target="_blank" rel="noreferrer" className="text-[11px] text-blue-300 bg-blue-900/30 px-2 py-1 rounded hover:bg-blue-900/50 font-medium flex items-center gap-1 transition-colors border border-blue-800/50">
                                        <Navigation2 className="w-3 h-3" /> Waze
                                      </a>
                                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${wp.lat},${wp.lon}&travelmode=driving`} target="_blank" rel="noreferrer" className="text-[11px] text-emerald-300 bg-emerald-900/30 px-2 py-1 rounded hover:bg-emerald-900/50 font-medium flex items-center gap-1 transition-colors border border-emerald-800/50">
                                        <MapPin className="w-3 h-3" /> Maps
                                      </a>
                                    </div>
                                  )}

                                  {isHotel && (
                                    <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-2">
                                      <HotelOverrideInputs 
                                        wpId={wp.id} 
                                        initialUrl={hotelOverrides[wp.id]?.url || ''} 
                                        initialPrice={hotelOverrides[wp.id]?.priceEur || ''} 
                                        setOverride={setHotelOverride} 
                                      />
                                    </div>
                                  )}

                                  {isBorder && wp.fromCountry && wp.toCountry && isSchengenPair(wp.fromCountry, wp.toCountry) && (
                                    <span className="inline-flex items-center gap-1 text-xs text-blue-300 bg-blue-900/30 px-2 py-0.5 rounded-full mt-1 border border-blue-800/50">
                                      🇪🇺 Шенгенська зона — без контролю
                                    </span>
                                  )}

                                  {isBorder && wp.fromCountry && wp.toCountry && !isSchengenPair(wp.fromCountry, wp.toCountry) && (
                                    <div className="mt-2">
                                      <select 
                                        className="w-full text-xs p-2 border rounded border-white/20 text-white bg-slate-800 hover:border-blue-400 focus:border-blue-400 outline-none cursor-pointer"
                                        onChange={(e) => {
                                          const crossings = getBorderCrossings(wp.fromCountry!, wp.toCountry!);
                                          const selected = crossings.find(c => c.id === e.target.value);
                                          if (selected) {
                                            insertBorderStop(selected, wp.distanceFromStart);
                                          }
                                        }}
                                        value=""
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
            <div className="relative w-full md:w-1/2 flex flex-col gap-4 overflow-y-auto pr-2 pb-10 md:pb-0">
              
              {/* Desktop Input */}
              <Card className="relative z-10 flex flex-col p-5 shrink-0 bg-black/40 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl text-white">
                <h3 className="font-semibold text-white mb-4">Параметри маршруту</h3>
                <StopsInput />
              </Card>

              {/* Smart Panels Accordion List */}
              <div className="flex-1 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden text-white">
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
                  
                  <AccordionItem value="fuel" className="border-b border-white/10 px-2">
                    <AccordionTrigger className="hover:no-underline px-4 py-4 data-[state=open]:text-blue-300">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pr-4 gap-1 text-left">
                        <div className="flex items-center gap-3 text-base">
                          <span className="text-xl">⛽</span> <span className="font-semibold">Розрахунок палива</span>
                          {needsFuel && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Потребує уваги"></span>
                          )}
                        </div>
                        {totalDistance > 0 && (
                          <span className="text-sm font-normal text-white/80 bg-white/10 border border-white/20 px-2 py-0.5 rounded-full ml-8 sm:ml-0 w-fit">
                            {totalDistance} км {totalFuelCost > 0 ? `• ${currencySymbol} ${totalFuelCost}` : ''}
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <FuelPanel />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="hotel" className="border-b border-white/10 px-2">
                    <AccordionTrigger className="hover:no-underline px-4 py-4 data-[state=open]:text-blue-300">
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

                  <AccordionItem value="insurance" className="border-b border-white/10 px-2">
                    <AccordionTrigger className="hover:no-underline px-4 py-4 data-[state=open]:text-blue-300">
                      <div className="flex items-center gap-3 text-base">
                        <span className="text-xl">🛡️</span> <span className="font-semibold">Страхування та віньєтки</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <InsurancePanel />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="borders" className="border-b border-white/10 px-2">
                    <AccordionTrigger className="hover:no-underline px-4 py-4 data-[state=open]:text-blue-300">
                      <div className="flex items-center gap-3 text-base">
                        <span className="text-xl">🛂</span> <span className="font-semibold">Кордони</span>
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
                    <AccordionTrigger className="hover:no-underline px-4 py-4 data-[state=open]:text-blue-300">
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
            </div>

          </div>
        </div>
      )}
    </>
  );
}

function HotelOverrideInputs({ 
  wpId, 
  initialUrl, 
  initialPrice, 
  setOverride 
}: { 
  wpId: string, 
  initialUrl: string, 
  initialPrice: number | string, 
  setOverride: (id: string, data: any) => void 
}) {
  const [url, setUrl] = useState(initialUrl);
  const [price, setPrice] = useState(initialPrice);
  const isChanged = url !== initialUrl || price !== initialPrice;

  // Sync with external state changes (e.g. resetTrip)
  useEffect(() => {
    setUrl(initialUrl);
    setPrice(initialPrice);
  }, [initialUrl, initialPrice]);

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full">
      <div className="flex-1 relative w-full">
        <input 
          type="text" 
          placeholder="🔗 Вставте посилання на готель (Booking, Maps)..." 
          className="w-full text-xs p-2 pr-8 border rounded border-slate-200 text-slate-700 bg-slate-50 hover:border-amber-300 focus:border-amber-500 focus:bg-white outline-none transition-colors"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        {url && url.startsWith('http') && (
          <a href={url} target="_blank" rel="noreferrer" className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700" title="Відкрити посилання">
            ↗
          </a>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 whitespace-nowrap">Ціна:</span>
        <div className="relative">
          <input 
            type="number" 
            placeholder="0" 
            className="w-20 sm:w-24 text-xs p-2 pr-6 border rounded border-slate-200 text-slate-700 bg-slate-50 hover:border-amber-300 focus:border-amber-500 focus:bg-white outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">€</span>
        </div>
        {isChanged && (
          <button 
            className="px-2 py-1.5 text-xs font-medium bg-amber-100 text-amber-700 hover:bg-amber-200 rounded transition-colors"
            onClick={() => {
              setOverride(wpId, { 
                url, 
                priceEur: price === '' ? undefined : Number(price) 
              });
            }}
          >
            Зберегти
          </button>
        )}
      </div>
    </div>
  );
}

