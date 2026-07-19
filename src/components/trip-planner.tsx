"use client";

import { useEffect, useState, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Card } from "@/components/ui/card";
import { MapPin, Navigation2, CheckCircle2, Map as MapIcon, List, Trash2, Fuel, Bed, ShieldCheck, Flag, Wallet, AlertCircle, Loader2 } from "lucide-react";
import { useTripStore, PanelType, HotelOverride } from "@/store/useTripStore";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formatTime = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h} год ${m > 0 ? m + ' хв' : ''}`;
};

export function TripPlanner() {
  const [mounted, setMounted] = useState(false);
  const [leftView, setLeftView] = useState<'timeline' | 'map'>('timeline');
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % 5); // 5 is the length of HERO_HEADINGS
    }, 6000);
    return () => clearInterval(timer);
  }, []);
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

  return (
    <>
      {isLoading && (
        <>
          <div className="fixed top-0 left-0 right-0 h-1 z-[10000] bg-white/10 overflow-hidden">
            <div className="h-full bg-blue-500 animate-[loading-bar_1.5s_ease-in-out_infinite]" style={{ transformOrigin: '0% 50%' }}></div>
          </div>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center" role="status" aria-label="Завантаження">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </>
      )}

      {!isCalculated ? (
        <div className="flex-grow flex flex-col items-center justify-center md:justify-start lg:justify-center pt-24 md:pt-[100px] lg:pt-24 pb-12 px-4 md:px-8 w-full max-w-[1280px] mx-auto min-h-[calc(100vh-80px)]">
          
          {/* Unified Hero Text */}
          <div className="text-white w-full text-center max-w-[500px] md:max-w-none px-2 mb-8 md:mb-[44px]">
            <div className="relative h-[90px] md:h-[60px] lg:h-[70px] w-full mb-2 md:mb-0">
              {[
                "Подорожі без кордонів",
                "Світ чекає на тебе",
                "Відкривай нові горизонти",
                "Назустріч пригодам",
                "Твій шлях, твої правила"
              ].map((heading, i) => (
                <h1 
                  key={heading}
                  className={`absolute inset-0 flex items-center justify-center text-4xl lg:text-5xl font-extrabold drop-shadow-md leading-tight transition-all duration-[1500ms] ease-in-out ${
                    i === heroIndex ? "opacity-100 translate-y-0 z-10" : "opacity-0 translate-y-2 z-0 pointer-events-none"
                  }`}
                >
                  {heading}
                </h1>
              ))}
            </div>
          </div>

          <div className="w-full flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-stretch justify-center max-w-[1000px]">
            
            {/* Left Column (Features) */}
            <div className="w-full md:w-1/2 flex flex-col order-3 md:order-1 max-w-[500px]">
              <LeftPlaceholder />
            </div>
            
            {/* Right Column (Form) */}
            <div className="w-full md:w-1/2 max-w-[500px] order-2 md:order-2">
              <div className="rounded-[20px] p-6 md:p-8 shadow-2xl relative h-full flex flex-col justify-center" style={{ background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(16px)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <div className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                </div>
                <h2 className="hidden md:block font-display text-2xl md:text-3xl font-extrabold text-white mb-8 relative z-10">Побудувати маршрут</h2>
                <div className="relative z-10">
                  <StopsInput />
                </div>
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
                                  <Fuel className="w-3 h-3 text-white" />
                                ) : isBorder ? (
                                  <Flag className="w-3 h-3 text-white" />
                                ) : isHotel ? (
                                  <Bed className="w-3 h-3 text-white" />
                                ) : (
                                  <CheckCircle2 className="w-3 h-3 text-white" />
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
                                  {wp.lat && wp.lon && (!isHotel || (isHotel && hotelOverrides[wp.id]?.lat)) && (
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
                                        initialPrice={hotelOverrides[wp.id]?.inputPrice ?? hotelOverrides[wp.id]?.priceEur ?? ''} 
                                        initialCurrency={hotelOverrides[wp.id]?.inputCurrency}
                                        initialLat={hotelOverrides[wp.id]?.lat}
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
                                      <Select 
                                        value={wp.borderId || ""}
                                        onValueChange={(val) => {
                                          const crossings = getBorderCrossings(wp.fromCountry!, wp.toCountry!);
                                          const selected = crossings.find(c => c.id === val);
                                          if (selected) {
                                            insertBorderStop(selected, wp.distanceFromStart);
                                          }
                                        }}
                                      >
                                        <SelectTrigger className="w-full text-xs">
                                          <SelectValue placeholder="Змінити пункт пропуску" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {getBorderCrossings(wp.fromCountry, wp.toCountry).map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
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
                    <AccordionTrigger className="hover:no-underline px-4 py-4 data-[state=open]:text-blue-300 group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pr-4 gap-1 text-left">
                        <div className="flex items-center gap-3 text-base">
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 group-data-[state=open]:text-blue-400 group-data-[state=open]:bg-blue-500/10 group-data-[state=open]:border-blue-500/20 transition-colors">
                            <Fuel className="w-4 h-4" />
                          </div>
                          <span className="font-semibold">Розрахунок палива</span>
                          {needsFuel && (
                            <span className="flex items-center gap-1 text-[10px] font-medium text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shadow-sm ml-1" title="Потребує уваги">
                              <AlertCircle className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        {totalDistance > 0 && (
                          <span className="text-sm font-normal text-white/80 bg-white/10 border border-white/20 px-2 py-0.5 rounded-full ml-11 sm:ml-0 w-fit">
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
                    <AccordionTrigger className="hover:no-underline px-4 py-4 data-[state=open]:text-blue-300 group">
                      <div className="flex items-center gap-3 text-base">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 group-data-[state=open]:text-blue-400 group-data-[state=open]:bg-blue-500/10 group-data-[state=open]:border-blue-500/20 transition-colors">
                          <Bed className="w-4 h-4" />
                        </div>
                        <span className="font-semibold">Ночівля та зупинки</span>
                        {needsHotel && (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shadow-sm ml-1" title="Потребує уваги">
                            <AlertCircle className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <HotelPanel />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="insurance" className="border-b border-white/10 px-2">
                    <AccordionTrigger className="hover:no-underline px-4 py-4 data-[state=open]:text-blue-300 group">
                      <div className="flex items-center gap-3 text-base">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 group-data-[state=open]:text-blue-400 group-data-[state=open]:bg-blue-500/10 group-data-[state=open]:border-blue-500/20 transition-colors">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <span className="font-semibold">Страхування та віньєтки</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <InsurancePanel />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="borders" className="border-b border-white/10 px-2">
                    <AccordionTrigger className="hover:no-underline px-4 py-4 data-[state=open]:text-blue-300 group">
                      <div className="flex items-center gap-3 text-base">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 group-data-[state=open]:text-blue-400 group-data-[state=open]:bg-blue-500/10 group-data-[state=open]:border-blue-500/20 transition-colors">
                          <Flag className="w-4 h-4" />
                        </div>
                        <span className="font-semibold">Кордони</span>
                        {needsBorders && (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shadow-sm ml-1" title="Потребує уваги">
                            <AlertCircle className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <BordersPanel />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="budget" className="px-2 border-none">
                    <AccordionTrigger className="hover:no-underline px-4 py-4 data-[state=open]:text-blue-300 group">
                      <div className="flex items-center gap-3 text-base">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 group-data-[state=open]:text-blue-400 group-data-[state=open]:bg-blue-500/10 group-data-[state=open]:border-blue-500/20 transition-colors">
                          <Wallet className="w-4 h-4" />
                        </div>
                        <span className="font-semibold">Загальний кошторис</span>
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
  initialCurrency,
  initialLat,
  setOverride 
}: { 
  wpId: string, 
  initialUrl: string, 
  initialPrice: number | string, 
  initialCurrency?: string,
  initialLat?: number,
  setOverride: (id: string, data: Partial<HotelOverride>) => void 
}) {
  const { exchangeRates, currency: globalCurrency } = useTripStore();
  const [url, setUrl] = useState(initialUrl);
  const [price, setPrice] = useState(initialPrice);
  const [currency, setCurrency] = useState(initialCurrency || globalCurrency);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [suggestions, setSuggestions] = useState<Array<{ id: string, name: string, description: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedUrl = useDebounce(url, 400);

  useEffect(() => {
    if (debouncedUrl && debouncedUrl.length > 2 && showSuggestions && !debouncedUrl.startsWith('http')) {
      setIsSearching(true);
      fetch(`/api/google/places?input=${encodeURIComponent(debouncedUrl)}&type=establishment`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'OK' && data.predictions) {
            setSuggestions(data.predictions.slice(0, 5).map((p: any) => ({
              id: p.place_id,
              name: p.structured_formatting.main_text,
              description: p.description
            })));
          } else {
            setSuggestions([]);
          }
        })
        .catch(() => setSuggestions([]))
        .finally(() => setIsSearching(false));
    } else {
      setSuggestions([]);
    }
  }, [debouncedUrl, showSuggestions]);

  // If we don't have a lat but we DO have a url, we should allow saving to attempt geocoding
  const isChanged = url !== initialUrl || String(price) !== String(initialPrice) || currency !== (initialCurrency || globalCurrency) || (url && !initialLat);

  // Sync with external state changes (e.g. resetTrip)
  useEffect(() => {
    setUrl(initialUrl);
    setPrice(initialPrice);
    setCurrency(initialCurrency || globalCurrency);
  }, [initialUrl, initialPrice, initialCurrency, globalCurrency]);

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg('');
    let lat: number | undefined;
    let lon: number | undefined;
    let name: string | undefined;

    // Try geocoding if url exists, regardless of whether it changed (in case previous attempt failed or wasn't done)
    if (url) {
       try {
         const { geocodeCity } = await import("@/lib/routing");
         const geo = await geocodeCity(url);
         if (geo) {
            lat = geo.lat;
            lon = geo.lon;
            name = geo.name;
         } else {
            console.warn("Geocode returned null for URL:", url);
            setErrorMsg("Не вдалося знайти координати. Спробуйте посилання з Google Maps.");
            setIsSaving(false);
            return;
         }
       } catch (err) {
         console.error("Geocoding failed during save:", err);
         setErrorMsg("Помилка під час пошуку координат.");
         setIsSaving(false);
         return;
       }
    }

    const numericPrice = price === '' ? undefined : Number(price);
    const rate = exchangeRates[currency] || 1;
    const priceEur = numericPrice !== undefined ? numericPrice / rate : undefined;

    setOverride(wpId, { 
      url, 
      inputPrice: numericPrice,
      inputCurrency: currency,
      priceEur,
      ...(lat && lon ? { lat, lon, name } : {})
    });
    setIsSaving(false);
  };

  return (
    <div className="w-full flex flex-col gap-1">
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full">
        <div className="flex-1 relative w-full">
          <input 
            type="text" 
            placeholder="🏨 Назва готелю або Booking..." 
            className="w-full text-xs p-2.5 pr-8 border rounded-xl border-white/10 text-white bg-white/5 hover:bg-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/20 outline-none transition-all placeholder:text-white/30 relative z-10"
            value={url}
            autoComplete="off"
            onChange={(e) => { setUrl(e.target.value); setErrorMsg(''); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            disabled={isSaving}
          />
          {showSuggestions && (suggestions.length > 0 || isSearching) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/20 rounded-xl shadow-2xl z-[100] max-h-[250px] overflow-y-auto">
              {isSearching ? (
                <div className="p-3 text-xs text-white/50 flex items-center gap-2 justify-center">
                  <Loader2 className="w-3 h-3 animate-spin" /> Пошук...
                </div>
              ) : (
                suggestions.map((s) => (
                  <div 
                    key={s.id} 
                    className="p-3 hover:bg-white/10 cursor-pointer text-xs border-b border-white/10 last:border-0 transition-colors"
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent onBlur from firing before click
                      setUrl(s.description);
                      setShowSuggestions(false);
                      setErrorMsg('');
                    }}
                  >
                    <div className="font-medium text-white">{s.name}</div>
                    <div className="text-[10px] text-white/50 mt-0.5">{s.description}</div>
                  </div>
                ))
              )}
            </div>
          )}
          {url && url.startsWith('http') && (
            <a href={url} target="_blank" rel="noreferrer" className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 transition-colors z-20" title="Відкрити посилання">
              ↗
            </a>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <span className="text-xs text-white/50 whitespace-nowrap">Ціна:</span>
          <div className="relative flex items-center">
            <input 
              type="number" 
              placeholder="0" 
              className="w-20 text-xs p-2.5 pr-1 border rounded-l-xl border-white/10 text-white bg-white/5 hover:bg-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/20 outline-none transition-all placeholder:text-white/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={isSaving}
            />
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              disabled={isSaving}
              className="w-16 h-full text-[11px] p-2.5 border-y border-r rounded-r-xl border-white/10 text-white/70 bg-white/10 hover:bg-white/20 focus:outline-none transition-all cursor-pointer appearance-none text-center"
            >
              {Object.keys(exchangeRates).map(c => (
                <option key={c} value={c} className="bg-slate-800">{c}</option>
              ))}
            </select>
          </div>
          {isChanged && (
            <button 
              className="px-3 py-2 w-20 text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? <span className="w-3 h-3 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" /> : "Зберегти"}
            </button>
          )}
        </div>
      </div>
      {errorMsg && (
        <div className="w-full text-[10px] text-red-400 mt-1 pl-1">
          {errorMsg}
        </div>
      )}
    </div>
  );
}

