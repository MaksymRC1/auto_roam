"use client";

import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { MapPin, Navigation, Navigation2, CheckCircle2, Map as MapIcon, List, Trash2, Fuel, Bed, ShieldCheck, Flag, Wallet, AlertCircle, Plus, Clock, Settings, Bookmark, Share2, Copy, Send, MessageCircle, Check, ArrowLeft } from "lucide-react";
import { useTripStore, PanelType, HotelOverride } from "@/store/useTripStore";
import { MapPanel } from "./panels/map-panel";
import { LeftPlaceholder } from "./left-placeholder";
import { FuelPanel } from "./panels/fuel-panel";
import { HotelPanel, Stay22Map } from "./panels/hotel-panel";
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
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader, SheetClose } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const formatTime = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h} год ${m > 0 ? m + ' хв' : ''}`;
};

export function TripPlanner() {
  const [mounted, setMounted] = useState(false);
  const [leftView, setLeftView] = useState<'timeline' | 'map'>('timeline');
  const [heroIndex, setHeroIndex] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isMobileFuelOpen, setIsMobileFuelOpen] = useState(false);
  const [selectedBorderInfoId, setSelectedBorderInfoId] = useState<string | null>(null);
  const [selectedStay22Id, setSelectedStay22Id] = useState<string | null>(null);
  const [isMobileInsuranceOpen, setIsMobileInsuranceOpen] = useState(false);
  const [hasSeenStops, setHasSeenStops] = useState(false);
  const [hasSeenHotel, setHasSeenHotel] = useState(false);
  const [hasSeenInsurance, setHasSeenInsurance] = useState(false);
  const [hasSeenBudget, setHasSeenBudget] = useState(false);

  // Helper to generate or read a persistent anonymous user ID
  const getOrCreateAnonymousUserId = (): string => {
    if (typeof window === "undefined") return "";
    let id = localStorage.getItem("autoroam_anon_user_id");
    if (!id) {
      id = "anon_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("autoroam_anon_user_id", id);
    }
    return id;
  };

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
    ignoredWaypoints, ignoreWaypoint, removeStop, calculateRoute,
    completedWaypoints, toggleWaypointCompletion, getShareUrl, getRawShareData, loadFromShareData,
    insuranceCost,
    hotelCustomTime, hotelCustomDistance, setHotelSettings
  } = useTripStore();

  useEffect(() => {
    setHasSeenBudget(false);
  }, [waypoints, fuelAmounts, hotelOverrides, insuranceCost]);

  const needsFuel = useMemo(() => {
    if (totalDistance <= 0) return false;
    let totalCostEur = 0;
    Object.entries(fuelAmounts).forEach(([code, amountStr]) => {
      totalCostEur += (parseFloat(amountStr) || 0) * (fuelPrices[code]?.[selectedFuelType] || 0);
    });
    return totalCostEur === 0;
  }, [totalDistance, fuelAmounts, fuelPrices, selectedFuelType]);

  const needsHotel = totalDuration > 480;

  useEffect(() => {
    if (isCalculated) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % 5);
    }, 6000);
    return () => clearInterval(timer);
  }, [isCalculated]);

  useEffect(() => {
    setMounted(true);
    // Parse URL on mount for shared trips
    const params = new URLSearchParams(window.location.search);
    const tripData = params.get('trip');
    if (tripData) {
      loadFromShareData(tripData);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [loadFromShareData]);

  const handleShare = async () => {
    setShareOpen(true);
    setCopied(false);
    setIsGeneratingLink(true);
    setShareLink("Генеруємо посилання...");

    try {
      const response = await fetch("/api/journey/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          routeData: getRawShareData(),
          anonymousUserId: getOrCreateAnonymousUserId(),
          userId: null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate short link");
      }

      const data = await response.json();
      if (data && data.id) {
        const shortUrl = `${window.location.origin}/journey/${data.id}`;
        setShareLink(shortUrl);
      } else {
        throw new Error("Invalid short link response");
      }
    } catch (error) {
      console.error("Error creating share link, falling back to long URL:", error);
      // Fallback: use long LZString url pointing to /journey page
      const longUrl = getShareUrl().replace("/?trip=", "/journey?trip=");
      setShareLink(longUrl);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleSaveRoute = () => {
    const url = getShareUrl().replace('/?trip=', '/journey?trip=');
    window.open(url, '_blank');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-HTTPS or permission denied
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!mounted) return null;

  return (
    <>


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
        <div className="max-w-[1280px] mx-auto w-full flex-1 flex flex-col relative pt-24 pb-32 md:pb-32 px-4 md:px-8 z-10">
          <div className="flex flex-col md:flex-row gap-6 lg:gap-8 w-full flex-1 pb-16 md:pb-8">
            
            {/* Mobile Bottom Navigation Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0F111A] border-t border-white/5 pb-4 pt-3 px-4 flex items-center justify-between rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
              
              {/* Toggle Map / Timeline */}
              <button 
                onClick={() => setLeftView(leftView === 'timeline' ? 'map' : 'timeline')} 
                className="relative flex items-center justify-center w-10 h-10 outline-none group"
                title={leftView === 'timeline' ? "Показати карту" : "Показати хронологію"}
              >
                <div className={`absolute inset-0 bg-[#3b82f6]/10 rounded-full transition-transform duration-300 ${leftView === 'map' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
                {leftView === 'timeline' ? (
                  <MapIcon className="w-5 h-5 relative z-10 text-white/50 group-hover:text-white/80 transition-colors" />
                ) : (
                  <Clock className="w-5 h-5 relative z-10 text-blue-400 group-hover:text-blue-300 transition-colors" />
                )}
              </button>
              
              {/* Route (Stops) Sheet */}
              <Sheet key="mobile-stops-sheet">
                <SheetTrigger render={<button onClick={() => setHasSeenStops(true)} className="relative flex items-center justify-center w-10 h-10 outline-none group" title="Параметри маршруту" />}>
                  <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 rounded-full transition-colors" />
                  <Plus className="w-5 h-5 relative z-10 text-white/50 group-hover:text-white/80 transition-colors" />
                  {!hasSeenStops && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-[#0F111A] z-20"></span>}
                </SheetTrigger>
                <SheetContent side="bottom" className="bg-slate-950/95 backdrop-blur-xl border-white/10 p-0 h-[85dvh] max-h-[85dvh] rounded-t-3xl overflow-hidden flex flex-col">
                  <SheetHeader className="p-5 border-b border-white/10 flex flex-row items-center justify-between shrink-0">
                    <SheetTitle className="text-white text-base">Параметри маршруту</SheetTitle>
                    <SheetClose render={
                      <button className="text-xs text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1 focus:outline-none shrink-0">
                        <ArrowLeft className="w-3 h-3" />
                        Назад
                      </button>
                    } />
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 custom-scrollbar">
                    <div className="p-5 text-white pb-24">
                      <StopsInput idPrefix="mobile-stops" />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Insurance & Vignettes Sheet */}
              <Sheet key="mobile-insurance-sheet" open={isMobileInsuranceOpen} onOpenChange={setIsMobileInsuranceOpen}>
                <SheetTrigger render={<button onClick={() => { setIsMobileInsuranceOpen(true); setHasSeenInsurance(true); }} className="relative flex items-center justify-center w-10 h-10 outline-none group" title="Страхування та віньєтки" />}>
                  <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 rounded-full transition-colors" />
                  <ShieldCheck className="w-5 h-5 relative z-10 text-white/50 group-hover:text-white/80 transition-colors" />
                  {!hasSeenInsurance && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-[#0F111A] z-20"></span>}
                </SheetTrigger>
                <SheetContent side="bottom" className="bg-slate-950/95 backdrop-blur-xl border-white/10 p-0 h-[85dvh] max-h-[85dvh] rounded-t-3xl overflow-hidden flex flex-col">
                  <SheetHeader className="p-5 border-b border-white/10 flex flex-row items-center justify-between shrink-0">
                    <SheetTitle className="text-white text-base">Страхування та віньєтки</SheetTitle>
                    <SheetClose render={
                      <button className="text-xs text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1 focus:outline-none shrink-0">
                        <ArrowLeft className="w-3 h-3" />
                        Назад
                      </button>
                    } />
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 custom-scrollbar">
                    <div className="p-5 text-white pb-24">
                      <InsurancePanel />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* General Cost/Budget Sheet */}
              <Sheet key="mobile-budget-sheet">
                <SheetTrigger render={<button onClick={() => setHasSeenBudget(true)} className="relative flex items-center justify-center w-10 h-10 outline-none group" title="Загальний кошторис" />}>
                  <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 rounded-full transition-colors" />
                  <Wallet className="w-5 h-5 relative z-10 text-white/50 group-hover:text-white/80 transition-colors" />
                  {!hasSeenBudget && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-[#0F111A] z-20"></span>}
                </SheetTrigger>
                <SheetContent side="bottom" className="bg-slate-950/95 backdrop-blur-xl border-white/10 p-0 h-[85dvh] max-h-[85dvh] rounded-t-3xl overflow-hidden flex flex-col">
                  <SheetHeader className="p-5 border-b border-white/10 flex flex-row items-center justify-between shrink-0">
                    <SheetTitle className="text-white text-base">Загальний кошторис</SheetTitle>
                    <SheetClose render={
                      <button className="text-xs text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1 focus:outline-none shrink-0">
                        <ArrowLeft className="w-3 h-3" />
                        Назад
                      </button>
                    } />
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 custom-scrollbar">
                    <div className="p-5 text-white pb-24">
                      <BudgetPanel />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* LEFT PANEL: Trip Timeline & Map Toggle */}
            <div className={`w-full md:w-1/2 flex flex-col gap-4 min-h-[50vh] md:h-[calc(100vh-140px)] shrink-0 transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              
              {/* Toggle Tabs (Desktop Only now since mobile has bottom nav) */}
              <Tabs value={leftView} onValueChange={(v) => setLeftView(v as 'timeline' | 'map')} className="hidden md:block w-full shrink-0">
                <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-white/10 text-white rounded-xl">
                  <TabsTrigger value="timeline" className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 rounded-lg">
                    <List className="w-4 h-4" /> Таймлайн
                  </TabsTrigger>
                  <TabsTrigger value="map" className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 rounded-lg">
                    <MapIcon className="w-4 h-4" /> Карта
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Card className="flex-1 overflow-hidden flex flex-col relative bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl text-white">
                {/* Map Sliding Panel on Mobile / Absolute overlay on Desktop */}
                <div className={`
                  transition-all duration-300
                  fixed bottom-0 left-0 right-0 h-[85vh] bg-slate-950 z-[45] rounded-t-3xl overflow-hidden border-t border-white/10 flex flex-col
                  md:absolute md:inset-0 md:z-0 md:h-auto md:bg-transparent md:rounded-none md:border-none
                  ${leftView === 'map' 
                    ? 'translate-y-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:opacity-100' 
                    : 'translate-y-full pointer-events-none md:translate-y-0 md:opacity-0'}
                `}>
                  <div className="md:hidden flex items-center justify-between p-5 border-b border-white/10 shrink-0 bg-slate-950/95 backdrop-blur-xl z-10">
                    <h3 className="text-white font-semibold">Карта маршруту</h3>
                    <button onClick={() => setLeftView('timeline')} className="text-white/50 hover:text-white transition-colors">
                       <span className="sr-only">Закрити</span>
                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <div className="flex-1 relative pb-20 md:pb-0">
                    <MapPanel />
                  </div>
                </div>
                
                {/* Timeline is always rendered. On Desktop it visually hides when map is active. On mobile it's always the background. */}
                <div className={`relative z-10 flex flex-col h-full bg-black/60 md:bg-transparent transition-opacity duration-300 ${
                  leftView === 'map' ? 'md:opacity-0 md:pointer-events-none' : 'opacity-100'
                }`}>
                  <div className="p-5 border-b border-white/10 bg-black/20 shrink-0 flex items-start justify-between">
                    <div>
                      <h2 className="font-bold text-lg text-white">Хронологія подорожі</h2>
                      <p className="text-sm font-medium text-white/60 mt-1">
                        {totalDistance} км • ~{formatTime(totalDuration)}
                      </p>
                    </div>
                    <button 
                      className="md:hidden p-2.5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors flex items-center justify-center relative focus:outline-none"
                      onClick={() => setIsMobileFuelOpen(true)}
                      title="Розрахунок палива"
                    >
                      <Fuel className="w-5 h-5" />
                      {needsFuel && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full border-2 border-[#131620]"></span>
                      )}
                    </button>
                  </div>
                  
                  <div className="flex-1 p-5 md:overflow-y-auto custom-scrollbar pb-12">
                    <div className="relative space-y-8" role="list" aria-label="Хронологія маршруту">
                        
                        {waypoints.filter(wp => !ignoredWaypoints.includes(wp.id)).map((wp, index, array) => {
                          const isLast = index === array.length - 1;
                          const isStart = wp.type === 'start';
                          const isFinish = wp.type === 'finish';
                          const isFuel = wp.type === 'fuel';
                          const isBorder = wp.type === 'border';
                          const isHotel = wp.id.startsWith('hotel-');
                          
                          return (
                            <div key={wp.id} className="relative flex items-start group" role="listitem">
                              {!isLast && (
                                <div className="absolute top-[30px] bottom-[-38px] left-[11px] w-0.5 bg-white/20 -translate-x-px z-0" />
                              )}
                              <div className="flex items-center justify-center w-6 h-6 mt-1.5 rounded-full bg-slate-900 border border-white/20 shadow-sm shrink-0 z-10">
                                {isStart || isFinish ? (
                                  <MapPin className="w-3 h-3 text-white/80" />
                                ) : isFuel ? (
                                  <Fuel className="w-3 h-3 text-white/80" />
                                ) : isBorder ? (
                                  <Flag className="w-3 h-3 text-white/80" />
                                ) : isHotel ? (
                                  <Bed className="w-3 h-3 text-white/80" />
                                ) : (
                                  <CheckCircle2 className="w-3 h-3 text-white/80" />
                                )}
                              </div>
                              
                              <div className={`flex-1 ml-4 bg-white/10 backdrop-blur-md p-3 rounded-lg border shadow-sm transition-all relative ${completedWaypoints.includes(wp.id) ? 'border-white/20 opacity-60' : 'border-white/10 group-hover:border-white/30'}`}>
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
                                    <span className="text-xs text-white/60 font-medium mt-1">Точка відправлення</span>
                                  )}
                                  {wp.lat && wp.lon && (!isHotel || (isHotel && hotelOverrides[wp.id]?.lat)) && (
                                    <div className="flex gap-2 mt-2 pt-2 border-t border-white/10 items-center">
                                      <a href={`https://waze.com/ul?ll=${wp.lat},${wp.lon}&navigate=yes`} target="_blank" rel="noreferrer" className="text-[11px] text-white/80 bg-white/5 px-2 py-1 rounded hover:bg-white/10 font-medium flex items-center gap-1 transition-colors border border-white/10">
                                        <Navigation2 className="w-3 h-3" /> Waze
                                      </a>
                                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${wp.lat},${wp.lon}&travelmode=driving`} target="_blank" rel="noreferrer" className="text-[11px] text-white/80 bg-white/5 px-2 py-1 rounded hover:bg-white/10 font-medium flex items-center gap-1 transition-colors border border-white/10">
                                        <MapPin className="w-3 h-3" /> Maps
                                      </a>
                                      {isBorder && (
                                        <button 
                                          onClick={(e) => {
                                            e.preventDefault();
                                            setSelectedBorderInfoId(wp.id);
                                          }}
                                          className={
                                            wp.fromCountry && wp.toCountry && isSchengenPair(wp.fromCountry, wp.toCountry)
                                              ? "text-white/80 bg-white/5 p-1.5 rounded hover:bg-white/10 flex items-center justify-center transition-colors border border-white/10 ml-auto"
                                              : "text-white/80 bg-white/5 p-1.5 rounded hover:bg-white/10 flex items-center justify-center transition-colors border border-white/10 ml-auto"
                                          }
                                          title="Інформація про пункт пропуску"
                                        >
                                          {wp.fromCountry && wp.toCountry && isSchengenPair(wp.fromCountry, wp.toCountry) ? (
                                            <Flag className="w-3.5 h-3.5" />
                                          ) : (
                                            <AlertCircle className="w-3.5 h-3.5" />
                                          )}
                                        </button>
                                      )}
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
                                      <button
                                        onClick={() => setSelectedStay22Id(wp.id)}
                                        className="w-full mt-1 bg-white/5 text-white/90 border border-white/10 hover:bg-white/10 transition-colors py-1.5 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5"
                                      >
                                        <MapPin className="w-3.5 h-3.5" /> Знайти готелі на мапі
                                      </button>
                                    </div>
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
                                          <span className="line-clamp-1 flex-1 text-left">
                                            {wp.borderId 
                                              ? getBorderCrossings(wp.fromCountry!, wp.toCountry!).find(c => c.id === wp.borderId)?.name || "Пункт пропуску"
                                              : "Змінити пункт пропуску"}
                                          </span>
                                        </SelectTrigger>
                                        <SelectContent>
                                          {getBorderCrossings(wp.fromCountry!, wp.toCountry!).map(c => (
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

                      {/* Action Buttons Below Timeline */}
                      <div className="mt-8 flex justify-center gap-12 pb-0">
                        <button 
                          onClick={handleSaveRoute}
                          className="w-14 h-14 bg-white/10 text-white hover:bg-white/20 border border-transparent hover:border-white/30 rounded-full transition-all flex justify-center items-center outline-none focus-visible:border-white/30 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#131620]"
                          title="Режим водіння"
                        >
                          <Navigation className="w-6 h-6" />
                        </button>
                        <button 
                          onClick={handleShare}
                          className="w-14 h-14 bg-white/10 text-white hover:bg-white/20 border border-transparent hover:border-white/30 rounded-full transition-all flex justify-center items-center outline-none focus-visible:border-white/30 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#131620]"
                          title="Поділитися маршрутом"
                        >
                          <Share2 className="w-6 h-6" />
                        </button>
                      </div>

                    </div>
                  </div>
              </Card>
            </div>

            {/* RIGHT PANEL: Input & Accordion Submenus (Desktop Only) */}
            <div className="hidden md:flex relative w-full md:w-1/2 flex-col gap-4 overflow-y-auto pr-2 pb-10 md:pb-0">
              
              {/* Desktop Input */}
              <Card className="relative z-10 flex flex-col p-5 shrink-0 bg-black/40 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl text-white">
                <h3 className="font-semibold text-white mb-4">Параметри маршруту</h3>
                <StopsInput idPrefix="desktop-stops" />
              </Card>

              {/* Smart Panels Accordion List */}
              <div className="flex-1 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden text-white">
                <AccordionPanels />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share/Save Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="bg-[#131620] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Зберегти та поділитися</DialogTitle>
            <DialogDescription className="text-white/60">
              Ваш маршрут збережено в базі даних. Надішліть це коротке посилання друзям, щоб вони могли переглянути вашу поїздку.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            <div className="grid flex-1 gap-2">
              <input
                readOnly
                value={shareLink}
                disabled={isGeneratingLink}
                className={`w-full bg-black/50 border border-white/20 rounded-md px-3 py-2 text-sm focus:outline-none ${
                  isGeneratingLink ? "text-white/40 animate-pulse cursor-wait" : "text-white"
                }`}
              />
            </div>
            <button
              onClick={copyToClipboard}
              disabled={isGeneratingLink}
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                isGeneratingLink
                  ? "bg-blue-600/50 cursor-not-allowed text-white/50"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          
          <div className={`mt-6 flex justify-center gap-4 transition-opacity duration-300 ${isGeneratingLink ? "opacity-45 pointer-events-none" : ""}`}>
            <a href={`https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent('\nПодивіться мій маршрут на AutoRoam!')}`} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-[#0088cc] hover:border-[#0088cc] transition-all group focus:outline-none focus:ring-2 focus:ring-[#0088cc] focus:ring-offset-2 focus:ring-offset-[#131620]">
              <Send className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
            </a>
            <a href={`viber://forward?text=${encodeURIComponent('Подивіться мій маршрут на AutoRoam! ' + shareLink)}`} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-[#7360f2] hover:border-[#7360f2] transition-all group focus:outline-none focus:ring-2 focus:ring-[#7360f2] focus:ring-offset-2 focus:ring-offset-[#131620]">
              <MessageCircle className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-[#1877f2] hover:border-[#1877f2] transition-all group focus:outline-none focus:ring-2 focus:ring-[#1877f2] focus:ring-offset-2 focus:ring-offset-[#131620]">
              <span className="font-bold text-white/70 text-lg group-hover:text-white transition-colors">f</span>
            </a>
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent('Мій маршрут!')}`} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-[#000000] hover:border-[#333333] transition-all group focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#131620]">
              <span className="font-bold text-white/70 text-lg group-hover:text-white transition-colors">𝕏</span>
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Fuel Modal */}
      <Dialog open={isMobileFuelOpen} onOpenChange={setIsMobileFuelOpen}>
        <DialogContent className="bg-[#131620] border-white/10 text-white sm:max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar" showCloseButton={false}>
          <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/10 space-y-0">
            <DialogTitle className="text-xl m-0 text-white">Розрахунок палива</DialogTitle>
            <button onClick={() => setIsMobileFuelOpen(false)} className="text-xs text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1 focus:outline-none shrink-0">
              <ArrowLeft className="w-3 h-3" />
              Назад
            </button>
          </DialogHeader>
          <div className="mt-4">
            <FuelPanel />
          </div>
        </DialogContent>
      </Dialog>

      {/* Borders Info Modal */}
      <Dialog open={selectedBorderInfoId !== null} onOpenChange={(open) => !open && setSelectedBorderInfoId(null)}>
        <DialogContent className="bg-[#131620] border-white/10 text-white sm:max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-xl">Інформація про пункт пропуску</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <BordersPanel selectedBorderId={selectedBorderInfoId || undefined} />
          </div>
          {/* Link to insurance submenu */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-2">
            <p className="text-xs text-white/50 text-center">Для перетину кордону на авто обов&#39;язково потрібен страховий поліс «Зелена картка».</p>
            <button
              onClick={() => {
                setSelectedBorderInfoId(null);
                setIsMobileInsuranceOpen(true);
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors focus:outline-none cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              Оформити страхування (Зелена картка)
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stay22 Hotel Modal */}
      <Dialog open={selectedStay22Id !== null} onOpenChange={(open) => !open && setSelectedStay22Id(null)}>
        <DialogContent className="bg-[#131620] border-white/10 text-white sm:max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-xl">Пошук готелів поблизу</DialogTitle>
          </DialogHeader>
          <div className="mt-2 flex flex-col gap-4">
            
            {/* Settings Explanation */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/80">
              <p className="mb-4">
                <span className="font-semibold text-white">💡 За замовчуванням:</span> зупинка для ночівлі планується кожні {hotelCustomTime ? Math.round(hotelCustomTime / 60) : 8} годин. Ви можете змінити цей час нижче:
              </p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between border-t border-white/10 pt-4">
                <label className="relative flex items-center cursor-pointer gap-3">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={!hotelCustomTime || hotelCustomTime === 0} 
                      onChange={(e) => {
                        if (e.target.checked) {
                          setHotelSettings('time', 0, hotelCustomDistance);
                        } else {
                          setHotelSettings('time', 8 * 60, hotelCustomDistance);
                        }
                      }}
                    />
                    <div className="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white/40"></div>
                  </div>
                  <span className="text-sm font-medium text-white/90">Без зупинок</span>
                </label>

                {(hotelCustomTime > 0) && (
                  <div className="flex items-center gap-2">
                    <span className="text-white/70">Кожні:</span>
                    <select 
                      value={String(Math.round(hotelCustomTime / 60))} 
                      onChange={(e) => {
                        const num = Number(e.target.value);
                        setHotelSettings('time', num * 60, hotelCustomDistance);
                      }}
                      className="w-16 bg-[#131620] border border-white/10 text-white rounded-xl px-2 py-1.5 text-sm focus:outline-none focus:border-white/30 appearance-none text-center"
                    >
                      <option value="4" className="bg-[#131620]">4</option>
                      <option value="6" className="bg-[#131620]">6</option>
                      <option value="8" className="bg-[#131620]">8</option>
                      <option value="10" className="bg-[#131620]">10</option>
                      <option value="12" className="bg-[#131620]">12</option>
                      <option value="14" className="bg-[#131620]">14</option>
                      <option value="16" className="bg-[#131620]">16</option>
                    </select>
                    <span className="text-white/70">годин</span>
                  </div>
                )}
              </div>
            </div>

            {selectedStay22Id && hotelCustomTime > 0 ? (
              <Stay22Map 
                lat={waypoints.find(w => w.id === selectedStay22Id)?.lat}
                lon={waypoints.find(w => w.id === selectedStay22Id)?.lon}
                address={waypoints.find(w => w.id === selectedStay22Id)?.name || ''}
                defaultOpen={true}
                isModalView={true}
              />
            ) : (
              hotelCustomTime === 0 && (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
                  <span className="text-2xl mb-2">🚗</span>
                  <p className="text-white/70 font-medium">Ви обрали подорож без зупинок на ночівлю.</p>
                  <p className="text-sm text-white/40 mt-1">Карта готелів прихована.</p>
                </div>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Extracted Accordion to avoid code duplication between mobile and desktop panels
function AccordionPanels() {
  const { 
    activePanel, 
    setActivePanel,
    totalDistance, 
    totalDuration,
    fuelPrices, selectedFuelType, fuelAmounts, currency, exchangeRates, crossedCountries
  } = useTripStore();

  const rate = exchangeRates[currency] || 1;
  const currencySymbol = getCurrencySymbol(currency);

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

  return (
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
                  <AccordionItem value="fuel" className="hidden md:block border-b border-white/10 px-2">
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
                        {needsBorders && (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shadow-sm ml-1" title="Потребує уваги">
                            <AlertCircle className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="flex flex-col gap-6">
                        <InsurancePanel />
                        <div className="h-px bg-white/10 my-2" />
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                            <Flag className="w-4 h-4 text-blue-400" />
                            Віньєтки та митні пункти
                          </h4>
                          <BordersPanel />
                        </div>
                      </div>
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
            placeholder="🏨 Додайте адресу..." 
            className="w-full text-xs p-2.5 pr-8 border rounded-xl border-white/10 text-white bg-white/5 hover:bg-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/20 outline-none transition-all placeholder:text-white/30 relative z-10"
            value={url}
            autoComplete="off"
            onChange={(e) => { setUrl(e.target.value); setErrorMsg(''); }}
            disabled={isSaving}
          />
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
              {['EUR', 'UAH', 'USD'].filter(c => exchangeRates[c]).map(c => (
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

