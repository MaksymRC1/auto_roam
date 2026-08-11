"use client";

import { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';
import { useTripStore, getHotelPrice, isHotelActive, getEffectiveFuelPrice } from "@/store/useTripStore";
import { MapPin, Navigation2, CheckCircle2, Bed, AlertCircle, Clock, Fuel, ExternalLink, Wallet, Heart, Share2, Copy, Check, Send, MessageCircle } from "lucide-react";
import { GoogleMapsIcon, WazeIcon } from './ui/brand-icons';
import { getCurrencySymbol, EMERGENCY_RESERVE_RATIO } from "@/lib/constants";
import { VIGNETTE_DB } from "@/lib/borders";
import { RatingModal } from "@/components/rating-modal";
import { JourneyOnboardingTour } from './journey-onboarding-tour';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Link from "next/link";

const formatTime = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h} год ${m > 0 ? m + ' хв' : ''}`;
};

export function JourneyView({ initialJourneyData }: { initialJourneyData?: any }) {
  const t = useTranslations('JourneyView');
  const [mounted, setMounted] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleShareClick = () => {
    if (typeof window !== "undefined") {
      setShareLink(window.location.href);
      setShareOpen(true);
      setCopied(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = shareLink;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const { 
    isCalculated, 
    waypoints, 
    completedWaypoints, 
    toggleWaypointCompletion,
    loadFromShareData,
    loadFromRawData,
    totalDistance,
    totalDuration,
    fuelPrices, customFuelPrices, selectedFuelType, fuelAmounts, currency, exchangeRates,
    insuranceCost, includeReserve, hotelOverrides, hotelCustomTime, crossedCountries,
    setHotelOverride
  } = useTripStore();

  useEffect(() => {
    setMounted(true);
    if (initialJourneyData) {
      loadFromRawData(initialJourneyData);
    } else {
      const params = new URLSearchParams(window.location.search);
      const tripData = params.get('trip');
      if (tripData) {
        loadFromShareData(tripData);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [initialJourneyData, loadFromShareData, loadFromRawData]);

  if (!mounted) return null;

  if (!isCalculated) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
          <div className="absolute inset-2 rounded-full border border-blue-400/20 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
          <div className="absolute inset-4 rounded-full border-2 border-dashed border-white/20 animate-[spin_4s_linear_infinite]"></div>
          <div className="absolute inset-4 animate-[spin_2s_linear_infinite]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-950 rounded-full p-1 text-blue-500">
              <Navigation2 className="w-5 h-5 rotate-90" />
            </div>
          </div>
          <div className="absolute">
            <MapPin className="w-8 h-8 text-white/80 animate-bounce" />
          </div>
        </div>
        <h2 className="mt-8 text-xl font-semibold text-white tracking-widest uppercase">
          Auto<span className="text-blue-500">Roam</span>
        </h2>
        <p className="mt-2 text-white/50 text-sm animate-pulse">
          {t('loading')}
        </p>
      </div>
    );
  }

  const rate = exchangeRates[currency] || 1;
  const symbol = getCurrencySymbol(currency);
  const formatCost = (eur: number) => `${(eur * rate).toFixed(0)} ${symbol}`;

  const totalFuelLiters = Object.values(fuelAmounts).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
  let totalFuelCostEur = 0;
  Object.entries(fuelAmounts).forEach(([code, amountStr]) => {
    const amount = parseFloat(amountStr) || 0;
    const priceEur = getEffectiveFuelPrice(code, fuelPrices, selectedFuelType, customFuelPrices);
    totalFuelCostEur += amount * priceEur;
  });

  const hotelStops = waypoints.filter(wp => wp.id.startsWith('hotel-'));
  const activeHotelStops = hotelStops.filter(wp => isHotelActive(wp.id, hotelCustomTime, hotelOverrides));
  const hasAnyHotelOverride = activeHotelStops.some(wp => hotelOverrides[wp.id]?.priceEur !== undefined);

  const hotelCostEur = activeHotelStops.reduce((sum, wp) => {
    const override = hotelOverrides[wp.id];
    if (override && override.priceEur !== undefined) return sum + override.priceEur;
    return sum + (hasAnyHotelOverride ? 0 : getHotelPrice(wp.countryCode || 'UNKNOWN'));
  }, 0);

  const vignetteCostEur = crossedCountries.reduce((sum, code) => {
    const vignette = VIGNETTE_DB[code];
    return sum + (vignette ? vignette.priceEur : 0);
  }, 0);

  const subtotalEur = totalFuelCostEur + hotelCostEur + vignetteCostEur + insuranceCost;
  const reserveEur = subtotalEur * EMERGENCY_RESERVE_RATIO;
  const totalEur = subtotalEur + (includeReserve ? reserveEur : 0);

  return (
    <>
      <JourneyOnboardingTour />
      
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 md:bottom-auto md:top-8 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-8 z-50 print:hidden flex flex-row md:flex-col gap-3 md:gap-3 md:bg-transparent px-4 py-3 md:p-0 border border-white/10 md:border-none rounded-full md:rounded-none shadow-2xl md:shadow-none backdrop-blur-xl md:backdrop-blur-none bg-black/60 md:bg-transparent">
        {/* Повернутися на сайт */}
        <div className="relative group flex items-center">
          <Link href="/" className="w-12 h-12 rounded-full bg-white/10 md:bg-black/40 backdrop-blur-md border border-white/5 md:border-transparent hover:border-white/20 focus-visible:border-white/20 outline-none flex items-center justify-center text-white hover:bg-white/20 transition-all md:shadow-lg" title={t('returnToSite')}>
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>route</span>
          </Link>
          <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 md:mb-0 md:left-full md:top-1/2 md:-translate-y-1/2 md:-translate-x-0 md:bottom-auto md:ml-4 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 bg-slate-900 border border-white/10 px-3 py-2 rounded-lg text-xs font-medium text-white/90 shadow-xl whitespace-nowrap pointer-events-none z-50">
            {t('returnToSite')}
          </span>
        </div>

        {/* Поділитися */}
        <div className="relative group flex items-center">
          <button 
            id="journey-tour-share"
            onClick={handleShareClick}
            className="w-12 h-12 rounded-full bg-white/10 md:bg-black/40 backdrop-blur-md border border-white/5 md:border-transparent hover:border-white/20 focus-visible:border-white/20 outline-none flex items-center justify-center text-white hover:bg-white/20 transition-all md:shadow-lg cursor-pointer"
            title={t('share')}
          >
            <Share2 className="w-5 h-5 text-white/90" />
          </button>
          <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 md:mb-0 md:left-full md:top-1/2 md:-translate-y-1/2 md:-translate-x-0 md:bottom-auto md:ml-4 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 bg-slate-900 border border-white/10 px-3 py-2 rounded-lg text-xs font-medium text-white/90 shadow-xl whitespace-nowrap pointer-events-none z-50">
            {t('share')}
          </span>
        </div>

        {/* Підтримати проект */}
        <div className="relative group flex items-center">
          <button 
            id="journey-tour-support"
            onClick={() => setIsRatingOpen(true)}
            className="w-12 h-12 rounded-full bg-white/10 md:bg-black/40 backdrop-blur-md border border-white/5 md:border-transparent hover:border-white/20 focus-visible:border-white/20 outline-none flex items-center justify-center text-white hover:bg-white/20 transition-all md:shadow-lg group focus:outline-none" 
            title={t('supportProject')}
          >
            <Heart className="w-6 h-6 text-white/90 transform-gpu will-change-transform transition-colors duration-300 fill-transparent group-hover:fill-white group-focus:fill-white" />
          </button>
          <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 md:mb-0 md:left-full md:top-1/2 md:-translate-y-1/2 md:-translate-x-0 md:bottom-auto md:ml-4 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 bg-slate-900 border border-white/10 px-3 py-2 rounded-lg text-xs font-medium text-white/90 shadow-xl whitespace-nowrap pointer-events-none z-50">
            {t('supportProject')}
          </span>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="border-white/10 text-white sm:max-w-md" style={{ background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(16px)" }}>
          <DialogHeader>
            <DialogTitle className="text-xl">Зберегти та поділитися</DialogTitle>
            <DialogDescription className="text-white/60">
              Поділіться цим посиланням з друзями, щоб вони могли переглянути вашу поїздку.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            <div className="grid flex-1 gap-2">
              <input
                readOnly
                value={shareLink}
                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
              />
            </div>
            <button
              onClick={copyToClipboard}
              className="px-4 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-bold shadow-lg active:scale-[0.98] shrink-0"
            >
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
          
          <div className="mt-6 flex justify-center gap-4">
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

      <RatingModal isOpen={isRatingOpen} onClose={() => setIsRatingOpen(false)} />

      <div className="w-full max-w-4xl mx-auto pb-32 md:pb-24 pt-8 px-4 font-sans">
        <div className="border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden" style={{ background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(16px)" }}>
        
        {/* Header */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center xl:flex-wrap justify-between mb-8 md:mb-12 gap-6 border-b border-white/10 pb-6 md:pb-8">
          <div className="w-full xl:w-auto overflow-hidden xl:overflow-visible shrink-0">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 xl:mb-0 whitespace-nowrap overflow-hidden text-ellipsis xl:whitespace-normal xl:overflow-visible xl:text-clip">{t('routeDetails')}</h1>
          </div>
          
          <div className="w-full xl:w-auto xl:flex-shrink-0">
            <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-3 mt-2 xl:mt-0">
              <div className="flex items-center justify-center md:justify-start gap-2 md:gap-3 bg-white/5 p-2.5 md:px-4 md:py-2.5 rounded-xl border border-white/10">
                <div className="p-1.5 bg-white/5 border border-white/10 rounded-lg shrink-0 text-white/70">
                  <Navigation2 className="w-4 h-4" />
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="hidden md:block text-[10px] md:text-xs uppercase font-bold text-white/50 tracking-wider">{t('distance')}</span>
                  <span className="font-bold text-white leading-tight text-sm md:text-base">{totalDistance} км</span>
                </div>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 md:gap-3 bg-white/5 p-2.5 md:px-4 md:py-2.5 rounded-xl border border-white/10">
                <div className="p-1.5 bg-white/5 border border-white/10 rounded-lg shrink-0 text-white/70">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="hidden md:block text-[10px] md:text-xs uppercase font-bold text-white/50 tracking-wider">{t('travelTime')}</span>
                  <span className="font-bold text-white leading-tight text-sm md:text-base">{formatTime(totalDuration)}</span>
                </div>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 md:gap-3 bg-white/5 p-2.5 md:px-4 md:py-2.5 rounded-xl border border-white/10">
                <div className="p-1.5 bg-white/5 border border-white/10 rounded-lg shrink-0 text-white/70">
                  <Fuel className="w-4 h-4" />
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="hidden md:block text-[10px] md:text-xs uppercase font-bold text-white/50 tracking-wider">{t('fuel')}</span>
                  <span className="font-bold text-white leading-tight text-sm md:text-base">~{totalFuelLiters.toFixed(0)} л</span>
                </div>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 md:gap-3 bg-white/5 p-2.5 md:px-4 md:py-2.5 rounded-xl border border-white/10">
                <div className="p-1.5 bg-white/5 border border-white/10 rounded-lg shrink-0 text-white/70">
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="hidden md:block text-[10px] md:text-xs uppercase font-bold text-white/50 tracking-wider">{t('budget')}</span>
                  <span className="font-bold text-white leading-tight text-sm md:text-base">{formatCost(totalEur)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative px-0 md:pl-10">
          <div className="space-y-6 md:space-y-8">
            {waypoints.map((wp, index) => {
              const isStart = index === 0;
              const isFinish = index === waypoints.length - 1;
              const isFuel = wp.type === 'fuel';
              const isHotel = wp.id.startsWith('hotel-');
              const isHotelSkipped = isHotel && !isHotelActive(wp.id, hotelCustomTime, hotelOverrides);
              const isBorder = wp.type === 'border';
              const isCompleted = completedWaypoints.includes(wp.id);
              
              const destName = isHotel && hotelOverrides[wp.id]?.address 
                ? hotelOverrides[wp.id].address 
                : wp.name;
              
              const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destName || '')}&travelmode=driving`;
              const wazeUrl = wp.lat && wp.lon ? `https://waze.com/ul?ll=${wp.lat},${wp.lon}&navigate=yes` : `https://waze.com/ul?q=${encodeURIComponent(wp.name)}&navigate=yes`;

              return (
                <div key={wp.id} className="relative flex items-start gap-5 md:gap-8 group print:break-inside-avoid">
                  {/* Vertical Line (connects to next item) */}
                  {!isFinish && (
                    <div className="hidden md:block absolute top-14 bottom-[-32px] left-[26px] w-1 bg-white/10 rounded-full print:bg-slate-300 z-0"></div>
                  )}

                  {/* Icon */}
                  <div className={`hidden md:flex relative z-10 w-14 h-14 rounded-full items-center justify-center shrink-0 border border-white/20 bg-white/5 backdrop-blur-md shadow-lg print:border-slate-300 print:bg-white ${isCompleted ? 'opacity-50 saturate-50' : ''}`}>
                    {isStart || isFinish ? <MapPin className="w-6 h-6 text-white/80 print:text-slate-800" /> :
                     isFuel ? <Fuel className="w-6 h-6 text-white/80 print:text-slate-800" /> :
                     isHotel ? <Bed className="w-6 h-6 text-white/80 print:text-slate-800" /> :
                     isBorder ? <AlertCircle className="w-6 h-6 text-white/80 print:text-slate-800" /> :
                     <MapPin className="w-6 h-6 text-white/80 print:text-slate-800" />}
                  </div>

                  {/* Content Card */}
                  <div 
                    id={index === 1 ? "journey-tour-waypoint" : undefined}
                    onClick={() => {
                      if (!isStart && !isFinish) {
                        toggleWaypointCompletion(wp.id);
                      }
                    }}
                    className={`flex-1 w-full bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 transition-all duration-300 relative z-10 print:bg-transparent print:border-slate-300 print:text-black ${
                    !isStart && !isFinish ? 'cursor-pointer' : ''
                  } ${
                    isCompleted 
                      ? 'opacity-60 bg-white/5 border-white/20' 
                      : isHotelSkipped
                        ? 'opacity-40 bg-white/5 border-white/10'
                        : 'hover:bg-white/10 hover:border-white/20'
                  }`}>
                    <div className="flex flex-col text-left md:pr-16">
                      <span className={`text-xl ${isStart || isFinish ? 'font-bold text-white print:text-black' : 'font-semibold text-white/90 print:text-black'} ${isCompleted || isHotelSkipped ? 'text-white/50 print:text-slate-500 line-through decoration-white/30' : ''}`}>
                        {wp.name}
                      </span>
                      <div className="mt-4 mb-2 flex flex-row items-center gap-2 md:gap-3 w-full">
                        <a 
                          href={googleMapsUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          onClick={(e) => e.stopPropagation()}
                          className={`flex-1 flex justify-center items-center gap-2 py-3.5 md:py-3 rounded-2xl md:rounded-xl bg-white/10 border border-white/20 transition-all active:scale-[0.98] shadow-sm ${
                            isCompleted || isHotelSkipped 
                              ? 'opacity-30 pointer-events-none' 
                              : 'text-white/90 hover:bg-white/20 hover:border-white/30 hover:text-white'
                          }`}
                          title="Google Maps"
                        >
                          <GoogleMapsIcon className="w-5 h-5" />
                          <span className="hidden md:inline font-semibold text-sm">Google Maps</span>
                        </a>
                        <a 
                          href={wazeUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          onClick={(e) => e.stopPropagation()}
                          className={`flex-1 flex justify-center items-center gap-2 py-3.5 md:py-3 rounded-2xl md:rounded-xl bg-white/10 border border-white/20 transition-all active:scale-[0.98] shadow-sm ${
                            isCompleted || isHotelSkipped 
                              ? 'opacity-30 pointer-events-none' 
                              : 'text-white/90 hover:bg-white/20 hover:border-white/30 hover:text-white'
                          }`}
                          title="Waze"
                        >
                          <WazeIcon className="w-5 h-5" />
                          <span className="hidden md:inline font-semibold text-sm">Waze</span>
                        </a>
                      </div>

                      {!isStart && (
                        <span className="text-sm md:text-base text-white/60 print:text-slate-600 mt-2 flex items-center gap-1.5">
                          <Navigation2 className="w-4 h-4" /> 
                          {wp.distanceFromStart} км від старту • {formatTime(wp.timeFromStart)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
    </>
  );
}
