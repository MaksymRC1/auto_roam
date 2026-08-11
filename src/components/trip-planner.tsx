"use client";

import { useEffect, useState, useMemo } from "react";
import { useTranslations } from 'next-intl';
import { Card } from "@/components/ui/card";
import { MapPin, Navigation, Navigation2, CheckCircle2, Map as MapIcon, List, Trash2, Fuel, Bed, ShieldCheck, Flag, Wallet, AlertCircle, Plus, Clock, Settings, Bookmark, Share2, Copy, Send, MessageCircle, Check, ArrowLeft, CarFront } from "lucide-react";
import { GoogleMapsIcon, WazeIcon } from './ui/brand-icons';
import { useTripStore, PanelType, HotelOverride, getEffectiveFuelPrice } from "@/store/useTripStore";
import { MapPanel } from "./panels/map-panel";
import { OnboardingTour } from "./onboarding-tour";
import { TabletOnboardingTour } from "./tablet-onboarding-tour";
import { DesktopOnboardingTour } from "./desktop-onboarding-tour";
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

import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader, SheetClose } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const formatTime = (mins: number, t: any) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h} ${t('hoursShort')} ${m > 0 ? m + ' ' + t('minutesShort') : ''}`.trim();
};

export function TripPlanner() {
  const t = useTranslations('TripPlanner');
  const tCommon = useTranslations('Common');
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
  const [hasSeenFuel, setHasSeenFuel] = useState(false);
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
    fuelPrices, customFuelPrices, selectedFuelType, fuelAmounts, currency, exchangeRates, crossedCountries,
    insertBorderStop, hotelOverrides, setHotelOverride,
    ignoredWaypoints, ignoreWaypoint, removeStop, calculateRoute,
    completedWaypoints, toggleWaypointCompletion, getShareUrl, getRawShareData, loadFromShareData,
    insuranceCost,
    hotelCustomTime, hotelCustomDistance, setHotelSettings,
    viewedPanels
  } = useTripStore();

  useEffect(() => {
    setHasSeenBudget(false);
  }, [waypoints, fuelAmounts, hotelOverrides, insuranceCost]);

  const needsFuel = useMemo(() => {
    if (totalDistance <= 0) return false;
    let totalCostEur = 0;
    Object.entries(fuelAmounts).forEach(([code, amountStr]) => {
      totalCostEur += (parseFloat(amountStr) || 0) * getEffectiveFuelPrice(code, fuelPrices, selectedFuelType, customFuelPrices);
    });
    if (viewedPanels.includes('fuel')) return false;
    return totalCostEur === 0;
  }, [totalDistance, fuelAmounts, fuelPrices, customFuelPrices, selectedFuelType, viewedPanels]);

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
    setShareLink(t('generatingLink'));

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
      <OnboardingTour />
      <TabletOnboardingTour />
      <DesktopOnboardingTour />

      {!isCalculated ? (
        <div className="flex-grow flex flex-col items-center justify-center md:justify-start lg:justify-center pt-24 md:pt-[100px] lg:pt-24 pb-12 px-4 md:px-8 w-full max-w-[1280px] mx-auto min-h-[calc(100vh-80px)]">
          
          {/* Unified Hero Text */}
          <div className="text-white w-full text-center max-w-[500px] md:max-w-none px-2 mb-8 md:mb-[44px]">
            <div className="relative h-[90px] md:h-[60px] lg:h-[70px] w-full mb-2 md:mb-0">
              {[
                t('heroTitle'),
                t('heroTitle2'),
                t('heroTitle3'),
                t('heroTitle4'),
                t('heroTitle5')
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
              <div id="desktop-tour-initial-search" className="rounded-[20px] p-6 md:p-8 shadow-2xl relative h-full flex flex-col justify-center" style={{ background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(16px)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <div className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                </div>
                <h2 className="hidden md:block font-display text-2xl md:text-3xl font-extrabold text-white mb-8 relative z-10">{t('buildRoute')}</h2>
                <div className="relative z-10">
                  <StopsInput />
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="max-w-[1280px] mx-auto w-full flex-1 flex flex-col relative pt-24 pb-24 md:pb-32 px-4 md:px-8 z-10">
          <div className="flex flex-col md:flex-row gap-6 lg:gap-8 w-full flex-1 pb-4 md:pb-8">
            
            {/* Mobile Bottom Navigation Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 pb-4 pt-3 px-4 flex items-center justify-between rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]" style={{ background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(16px)" }}>
              
              
              {/* Route (Stops) Sheet */}
              <Sheet key="mobile-stops-sheet">
                <SheetTrigger render={<button id="tour-step-stops" onClick={() => setHasSeenStops(true)} className="relative flex items-center justify-center w-10 h-10 outline-none group" title={t('routeParams')} />}>
                  <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 rounded-full transition-colors" />
                  <Plus className="w-5 h-5 relative z-10 text-white/50 group-hover:text-white/80 transition-colors" />
                  {!hasSeenStops && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-[#0F111A] z-20"></span>}
                </SheetTrigger>
                <SheetContent side="bottom" className="border-white/10 p-0 h-[85dvh] max-h-[85dvh] rounded-t-3xl overflow-hidden flex flex-col" style={{ background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(16px)" }}>
                  <SheetHeader className="p-5 border-b border-white/10 flex flex-row items-center justify-between shrink-0">
                    <SheetTitle className="text-white text-base">{t('routeParams')}</SheetTitle>
                    <SheetClose render={
                      <button className="text-xs text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1 focus:outline-none shrink-0">
                        <ArrowLeft className="w-3 h-3" />
                        {t('back')}
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

              {/* Fuel Settings */}
              <button 
                id="tour-step-fuel"
                onClick={() => { setIsMobileFuelOpen(true); setHasSeenFuel(true); }}
                className="relative flex items-center justify-center w-10 h-10 outline-none group"
                title={t('fuelCalculation')}
              >
                <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 rounded-full transition-colors" />
                <Fuel className="w-5 h-5 relative z-10 text-white/50 group-hover:text-white/80 transition-colors" />
                {!hasSeenFuel && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-[#0F111A] z-20"></span>}
              </button>

              {/* Insurance & Vignettes Sheet */}
              <Sheet key="mobile-insurance-sheet" open={isMobileInsuranceOpen} onOpenChange={setIsMobileInsuranceOpen}>
                <SheetTrigger render={<button id="tour-step-insurance" onClick={() => { setIsMobileInsuranceOpen(true); setHasSeenInsurance(true); }} className="relative flex items-center justify-center w-10 h-10 outline-none group" title={t('insuranceAndVignettes')} />}>
                  <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 rounded-full transition-colors" />
                  <ShieldCheck className="w-5 h-5 relative z-10 text-white/50 group-hover:text-white/80 transition-colors" />
                  {!hasSeenInsurance && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-[#0F111A] z-20"></span>}
                </SheetTrigger>
                <SheetContent side="bottom" className="border-white/10 p-0 h-[85dvh] max-h-[85dvh] rounded-t-3xl overflow-hidden flex flex-col" style={{ background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(16px)" }}>
                  <SheetHeader className="p-5 border-b border-white/10 flex flex-row items-center justify-between shrink-0">
                    <SheetTitle className="text-white text-base">{t('insuranceAndVignettes')}</SheetTitle>
                    <SheetClose render={
                      <button className="text-xs text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1 focus:outline-none shrink-0">
                        <ArrowLeft className="w-3 h-3" />
                        {t('back')}
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
                <SheetTrigger render={<button id="tour-step-budget" onClick={() => setHasSeenBudget(true)} className="relative flex items-center justify-center w-10 h-10 outline-none group" title={t('totalEstimate')} />}>
                  <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 rounded-full transition-colors" />
                  <Wallet className="w-5 h-5 relative z-10 text-white/50 group-hover:text-white/80 transition-colors" />
                  {!hasSeenBudget && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-[#0F111A] z-20"></span>}
                </SheetTrigger>
                <SheetContent side="bottom" className="border-white/10 p-0 h-[85dvh] max-h-[85dvh] rounded-t-3xl overflow-hidden flex flex-col" style={{ background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(16px)" }}>
                  <SheetHeader className="p-5 border-b border-white/10 flex flex-row items-center justify-between shrink-0">
                    <SheetTitle className="text-white text-base">{t('totalEstimate')}</SheetTitle>
                    <SheetClose render={
                      <button className="text-xs text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1 focus:outline-none shrink-0">
                        <ArrowLeft className="w-3 h-3" />
                        {t('back')}
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
                    <List className="w-4 h-4" /> {t('timeline')}
                  </TabsTrigger>
                  <TabsTrigger value="map" className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 rounded-lg">
                    <MapIcon className="w-4 h-4" /> {t('map')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Card id="desktop-tour-map" className="flex-1 overflow-hidden flex flex-col relative bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl text-white">
                {/* Desktop Map Overlay (Hidden on Mobile) */}
                <div className={`
                  hidden md:flex transition-all duration-300
                  absolute inset-0 z-0 h-auto bg-transparent rounded-none border-none flex-col
                  ${leftView === 'map' 
                    ? 'opacity-100' 
                    : 'pointer-events-none opacity-0'}
                `}>
                  <div className="flex-1 relative pb-0">
                    <MapPanel />
                  </div>
                </div>
                
                {/* Timeline is always rendered. On Desktop it visually hides when map is active. On mobile it's always the background. */}
                <div className="w-full flex-1 flex flex-col md:overflow-hidden relative bg-black/60 md:bg-transparent">
                  <div className={`relative z-10 flex flex-col h-full bg-black/60 md:bg-transparent transition-opacity duration-300 ${
                    leftView === 'map' ? 'md:opacity-0 md:pointer-events-none' : 'opacity-100'
                  }`}>
                  <div className="p-5 border-b border-white/10 bg-black/20 shrink-0 flex items-start justify-between">
                    <div>
                      <h2 className="font-bold text-lg text-white">{t('routeTimeline')}</h2>
                      <p className="text-sm font-medium text-white/60 mt-1">
                        {totalDistance} {t('km')} • ~{formatTime(totalDuration, t)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-5 md:overflow-y-auto custom-scrollbar pb-12">
                    <div className="relative space-y-8" role="list" aria-label={t('timelineAriaLabel')}>
                        
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
                                    title={t('removeFromTimeline')}
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
                                      {t('afterKm', { distance: wp.distanceFromStart })} <span className="text-white/30">•</span> {formatTime(wp.timeFromStart, t)}
                                    </span>
                                  )}
                                  {isStart && (
                                    <span className="text-xs text-white/60 font-medium mt-1">{t('originPoint')}</span>
                                  )}
                                  {wp.lat && wp.lon && (!isHotel || (isHotel && hotelOverrides[wp.id]?.lat)) && (
                                    <div className="flex gap-2 mt-2 pt-2 border-t border-white/10 items-center w-full">
                                      {(() => {
                                        const destName = isHotel && hotelOverrides[wp.id]?.address 
                                          ? hotelOverrides[wp.id].address 
                                          : wp.name;
                                        return (
                                          <>
                                            <a href={`https://waze.com/ul?ll=${wp.lat},${wp.lon}&navigate=yes`} target="_blank" rel="noreferrer" className="flex-1 bg-white/5 text-white/90 border border-white/10 hover:bg-white/10 transition-colors py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 active:scale-[0.98]" title="Waze">
                                              <WazeIcon className="w-4 h-4" />
                                              Waze
                                            </a>
                                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destName || '')}&travelmode=driving`} target="_blank" rel="noreferrer" className="flex-1 bg-white/5 text-white/90 border border-white/10 hover:bg-white/10 transition-colors py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 active:scale-[0.98]" title="Google Maps">
                                              <GoogleMapsIcon className="w-4 h-4" />
                                              Maps
                                            </a>
                                          </>
                                        );
                                      })()}
                                      {isBorder && (
                                        <button 
                                          onClick={(e) => {
                                            e.preventDefault();
                                            setSelectedBorderInfoId(wp.id);
                                          }}
                                          className="shrink-0 bg-white/5 text-white/90 border border-white/10 hover:bg-white/10 transition-colors py-2 px-3 rounded-lg flex items-center justify-center active:scale-[0.98] ml-auto"
                                          title={t('borderInfo')}
                                        >
                                          {wp.fromCountry && wp.toCountry && isSchengenPair(wp.fromCountry, wp.toCountry) ? (
                                            <Flag className="w-4 h-4" />
                                          ) : (
                                            <AlertCircle className="w-4 h-4" />
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
                                        <MapPin className="w-3.5 h-3.5" /> {t('findHotelsOnMap')}
                                      </button>
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
                          title={t('saveAndShare')}
                        >
                          <Navigation className="w-6 h-6" />
                        </button>
                        <button 
                          onClick={handleShare}
                          className="w-14 h-14 bg-white/10 text-white hover:bg-white/20 border border-transparent hover:border-white/30 rounded-full transition-all flex justify-center items-center outline-none focus-visible:border-white/30 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#131620]"
                          title={t('saveAndShare')}
                        >
                          <Share2 className="w-6 h-6" />
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* RIGHT PANEL: Input & Accordion Submenus (Desktop Only) */}
            <div className="hidden md:flex relative w-full md:w-1/2 flex-col gap-4 overflow-y-auto pr-2 pb-10 md:pb-0">
              
              {/* Desktop Input */}
              <Card id="desktop-tour-search" className="relative z-10 flex flex-col p-5 shrink-0 bg-black/40 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl text-white">
                <h3 className="font-semibold text-white mb-4">{t('routeParams')}</h3>
                <StopsInput idPrefix="desktop-stops" />
              </Card>

              {/* Smart Panels Accordion List */}
              <div id="desktop-tour-panels" className="flex-1 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden text-white">
                <AccordionPanels />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share/Save Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="border-white/10 text-white sm:max-w-md" style={{ background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(16px)" }}>
          <DialogHeader>
            <DialogTitle className="text-xl">{t('saveAndShare')}</DialogTitle>
            <DialogDescription className="text-white/60">
              {t('shareLinkDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            <div className="grid flex-1 gap-2">
              <input
                readOnly
                value={shareLink}
                disabled={isGeneratingLink}
                className={`w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none ${
                  isGeneratingLink ? "text-white/40 animate-pulse cursor-wait" : "text-white"
                }`}
              />
            </div>
            <button
              onClick={copyToClipboard}
              disabled={isGeneratingLink}
              className={`px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] shrink-0 ${
                isGeneratingLink
                  ? "bg-white/50 cursor-not-allowed text-slate-900/50"
                  : "bg-white hover:bg-slate-100 text-slate-900"
              }`}
            >
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
          
          <div className={`mt-6 flex justify-center gap-4 transition-opacity duration-300 ${isGeneratingLink ? "opacity-45 pointer-events-none" : ""}`}>
            <a href={`https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent('\n' + t('telegramShareText'))}`} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-[#0088cc] hover:border-[#0088cc] transition-all group focus:outline-none focus:ring-2 focus:ring-[#0088cc] focus:ring-offset-2 focus:ring-offset-[#131620]">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.96 1.25-5.54 3.67-.52.36-.99.53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.29-.48.79-.74 3.08-1.34 5.15-2.23 6.19-2.66 2.95-1.23 3.56-1.44 3.96-1.45.09 0 .28.02.41.1.11.08.14.19.16.27-.01.04.01.12 0 .18z"/></svg>
            </a>
            <a href={`viber://forward?text=${encodeURIComponent(t('viberShareText') + ' ' + shareLink)}`} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-[#7360f2] hover:border-[#7360f2] transition-all group focus:outline-none focus:ring-2 focus:ring-[#7360f2] focus:ring-offset-2 focus:ring-offset-[#131620]">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M18.88 5.12A10 10 0 0 0 4.29 17.5L2 22l4.63-2.19A10 10 0 0 0 18.88 5.12zm-3.34 11.23c-.41.52-1.14.73-1.68.32-.48-.36-1.02-.85-1.59-1.43-1.08-1.09-2.05-2.43-2.68-3.79-.34-.73-.24-1.58.26-2.09.28-.29.58-.55.89-.8.3-.25.59-.44.81-.3.12.08.26.17.41.34.46.54.91 1.07 1.34 1.62.13.16.24.32.33.5.08.16.14.35.08.57-.1.35-.38.65-.63.93-.16.17-.3.34-.35.53-.08.28.06.66.4.99.71.69 1.48 1.25 2.15 1.45.2.06.4-.04.57-.22.25-.26.54-.56.84-.71.18-.09.36-.14.54-.15.22-.01.44.05.65.17.5.28.98.59 1.46.88.22.14.45.28.69.45.16.11.27.24.35.41.09.18.15.39.11.64-.1.67-.48 1.4-1.12 1.64z"/></svg>
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-[#1877f2] hover:border-[#1877f2] transition-all group focus:outline-none focus:ring-2 focus:ring-[#1877f2] focus:ring-offset-2 focus:ring-offset-[#131620]">
              <span className="font-bold text-white/70 text-lg group-hover:text-white transition-colors">f</span>
            </a>
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(t('twitterShareText'))}`} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-[#000000] hover:border-[#333333] transition-all group focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#131620]">
              <span className="font-bold text-white/70 text-lg group-hover:text-white transition-colors">𝕏</span>
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Fuel Modal */}
      <Dialog open={isMobileFuelOpen} onOpenChange={setIsMobileFuelOpen}>
        <DialogContent className="border-white/10 text-white sm:max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar" showCloseButton={false} style={{ background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(16px)" }}>
          <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/10 space-y-0">
            <DialogTitle className="text-xl m-0 text-white">{t('fuelCalculation')}</DialogTitle>
            <button onClick={() => setIsMobileFuelOpen(false)} className="text-xs text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1 focus:outline-none shrink-0">
              <ArrowLeft className="w-3 h-3" />
              {t('back')}
            </button>
          </DialogHeader>
          <div className="mt-4">
            <FuelPanel />
          </div>
        </DialogContent>
      </Dialog>

      {/* Borders Info Modal */}
      <Dialog open={selectedBorderInfoId !== null} onOpenChange={(open) => !open && setSelectedBorderInfoId(null)}>
        <DialogContent className="border-white/10 text-white sm:max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar" style={{ background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(16px)" }}>
          <DialogHeader>
            <DialogTitle className="text-xl">{t('borderInfo')}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <BordersPanel selectedBorderId={selectedBorderInfoId || undefined} />
          </div>
          {/* Link to insurance submenu */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-2">
            <p className="text-xs text-white/50 text-center">{t('greenCardNotice')}</p>
            <button
              onClick={() => {
                setSelectedBorderInfoId(null);
                setIsMobileInsuranceOpen(true);
              }}
              className="w-full bg-white text-slate-900 hover:bg-slate-100 rounded-full py-3.5 font-bold text-[15px] shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2 outline-none cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-slate-700" />
              {t('buyGreenCard')}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stay22 Hotel Modal */}
      <Dialog open={selectedStay22Id !== null} onOpenChange={(open) => !open && setSelectedStay22Id(null)}>
        <DialogContent className="border-white/10 text-white sm:max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar" style={{ background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(16px)" }}>
          <DialogHeader>
            <DialogTitle className="text-xl">{t('findHotelsNearby')}</DialogTitle>
          </DialogHeader>
          <div className="mt-2 flex flex-col gap-4">
            
            {/* Settings Explanation */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/80">
              <p className="mb-4">
                <span className="font-semibold text-white">{t('hotelDefaultTip').split(':')[0]}:</span> {t('hotelDefaultTip').split(':')[1]} {hotelCustomTime ? Math.round(hotelCustomTime / 60) : 8} {t('hours')}.
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
                  <span className="text-sm font-medium text-white/90">{t('noStops')}</span>
                </label>

                {(hotelCustomTime > 0) && (
                  <div className="flex items-center gap-2">
                    <span className="text-white/70">{t('every')}</span>
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
                    <span className="text-white/70">{t('hours')}</span>
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
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/50">
                    <CarFront className="w-6 h-6" />
                  </div>
                  <p className="text-white/70 font-medium">{t('noOvernightSelected')}</p>
                  <p className="text-sm text-white/40 mt-1">{t('hotelMapHidden')}</p>
                </div>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* Mobile Onboarding Tour */}
      <div className="md:hidden">
        <OnboardingTour />
      </div>
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
    fuelPrices, customFuelPrices, selectedFuelType, fuelAmounts, currency, exchangeRates, crossedCountries,
    insuranceCost,
    viewedPanels
  } = useTripStore();

  const rate = exchangeRates[currency] || 1;
  const currencySymbol = getCurrencySymbol(currency);

  const totalFuelCost = useMemo(() => {
    let totalCostEur = 0;
    Object.entries(fuelAmounts).forEach(([code, amountStr]) => {
      const amount = parseFloat(amountStr) || 0;
      const priceEur = getEffectiveFuelPrice(code, fuelPrices, selectedFuelType, customFuelPrices);
      totalCostEur += amount * priceEur;
    });
    return Math.round(totalCostEur * rate);
  }, [fuelAmounts, fuelPrices, customFuelPrices, selectedFuelType, rate]);

  const needsFuel = totalDistance > 0 && totalFuelCost === 0 && !viewedPanels.includes('fuel');
  const needsHotel = totalDuration > 480;
  const needsBorders = crossedCountries.length > 1 && !viewedPanels.includes('insurance');
  const needsBudget = (needsFuel || needsBorders || needsHotel) && !viewedPanels.includes('budget');

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
                      <div className="flex items-center gap-3 w-full pr-2">
                        <div className="w-8 h-8 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 group-data-[state=open]:text-blue-400 group-data-[state=open]:bg-blue-500/10 group-data-[state=open]:border-blue-500/20 transition-colors">
                          <Fuel className="w-4 h-4" />
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-left flex-1 min-w-0">
                          <span className="font-semibold text-base leading-tight">{t('fuelCalcTitle')}</span>
                          {needsFuel && (
                            <span className="flex shrink-0 items-center justify-center w-5 h-5 text-amber-300 bg-amber-500/10 rounded-full border border-amber-500/20 shadow-sm" title={t('needsAttention')}>
                              <AlertCircle className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {totalDistance > 0 && (
                            <span className="text-xs font-medium text-white/80 bg-white/10 border border-white/20 px-2 py-0.5 rounded-full whitespace-nowrap">
                              {totalDistance} {t('km')} {totalFuelCost > 0 ? `• ${currencySymbol} ${totalFuelCost}` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <FuelPanel />
                    </AccordionContent>
                  </AccordionItem>

                  {/* Ночівля прибрана згідно побажань */}

                  <AccordionItem value="insurance" className="border-b border-white/10 px-2">
                    <AccordionTrigger className="hover:no-underline px-4 py-4 data-[state=open]:text-blue-300 group">
                      <div className="flex items-center gap-3 w-full pr-2">
                        <div className="w-8 h-8 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 group-data-[state=open]:text-blue-400 group-data-[state=open]:bg-blue-500/10 group-data-[state=open]:border-blue-500/20 transition-colors">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-left flex-1 min-w-0">
                          <span className="font-semibold text-base leading-tight">{t('insuranceTitle')}</span>
                          {needsBorders && (
                            <span className="flex shrink-0 items-center justify-center w-5 h-5 text-amber-300 bg-amber-500/10 rounded-full border border-amber-500/20 shadow-sm" title={t('needsAttention')}>
                              <AlertCircle className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="flex flex-col gap-6">
                        <InsurancePanel />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="budget" className="px-2 border-none">
                    <AccordionTrigger className="hover:no-underline px-4 py-4 data-[state=open]:text-blue-300 group">
                      <div className="flex items-center gap-3 w-full pr-2">
                        <div className="w-8 h-8 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 group-data-[state=open]:text-blue-400 group-data-[state=open]:bg-blue-500/10 group-data-[state=open]:border-blue-500/20 transition-colors">
                          <Wallet className="w-4 h-4" />
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-left flex-1 min-w-0">
                          <span className="font-semibold text-base leading-tight">{t('totalBudgetTitle')}</span>
                          {needsBudget && (
                            <span className="flex shrink-0 items-center justify-center w-5 h-5 text-amber-300 bg-amber-500/10 rounded-full border border-amber-500/20 shadow-sm" title={t('needsAttention')}>
                              <AlertCircle className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
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
            setErrorMsg(t('geocodeError'));
            setIsSaving(false);
            return;
         }
       } catch (err) {
         console.error("Geocoding failed during save:", err);
         setErrorMsg(t('geocodeFetchError'));
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
    <div className="w-full flex flex-col gap-2.5">
      <div className="relative w-full">
        <input 
          type="text" 
          placeholder={t('addAddressPlaceholder')} 
          className="w-full text-xs p-2.5 pr-8 border rounded-xl border-white/10 text-white bg-white/5 hover:bg-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/20 outline-none transition-all placeholder:text-white/30 relative z-10"
          value={url}
          autoComplete="off"
          onChange={(e) => { setUrl(e.target.value); setErrorMsg(''); }}
          disabled={isSaving}
        />
        {url && url.startsWith('http') && (
          <a href={url} target="_blank" rel="noreferrer" className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 transition-colors z-20" title={t('openLink')}>
            ↗
          </a>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 w-full">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs text-white/50 whitespace-nowrap">{t('price')}</span>
          <div className="relative flex items-center flex-1 h-9">
            <input 
              type="number" 
              placeholder="0" 
              className="w-full min-w-0 h-full text-xs px-3 border rounded-l-xl border-white/10 text-white bg-white/5 hover:bg-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/20 outline-none transition-all placeholder:text-white/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
              {isSaving ? <span className="w-3 h-3 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" /> : tCommon('save')}
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

