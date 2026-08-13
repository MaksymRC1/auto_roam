"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTripStore, getHotelPrice, isHotelActive } from "@/store/useTripStore";
import { BedDouble, ExternalLink, MapPin, Settings2, Map as MapIcon } from "lucide-react";
import { useTranslations } from 'next-intl';

export function Stay22Map({ lat, lon, address, defaultOpen = false, isModalView = false }: { lat?: number; lon?: number; address: string; defaultOpen?: boolean; isModalView?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const t = useTranslations('Hotel');

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium shadow-sm transition-all"
      >
        <MapIcon className="w-4 h-4 mr-2" /> {t('findHotelsStay22')}
      </Button>
    );
  }

  // Use the user's specific Stay22 Affiliate ID
  const src = `https://www.stay22.com/embed/gm?aid=6a5ce5360d30f9c7d2a22934&${lat && lon ? `lat=${lat}&lng=${lon}` : `address=${encodeURIComponent(address)}`}&maincolor=f59e0b`;

  return (
    <div className="w-full flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/5 text-white/80 text-xs p-3 rounded-lg border border-white/10 gap-3">
        {isModalView ? (
          <p>{t('foundHotelTip1')}</p>
        ) : (
          <p>{t('foundHotelTip2')}</p>
        )}
        {!isModalView && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsOpen(false)}
            className="h-7 text-xs shrink-0 bg-white/10 border-white/20 text-white hover:bg-white/20 w-full sm:w-auto"
          >
            {t('hideMap')}
          </Button>
        )}
      </div>
      <div className="w-full h-[450px] rounded-lg overflow-hidden border border-white/10 shadow-inner relative">
        <iframe
          src={src}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          title={t('hotelMapTitle')}
        ></iframe>
      </div>
    </div>
  );
}

export function HotelPanel() {
  const { 
    waypoints, 
    hotelMode: mode, 
    hotelCustomTime: customTime, 
    hotelCustomDistance: customDistance, 
    setHotelSettings,
    currency,
    exchangeRates,
    hotelOverrides,
    setHotelOverride
  } = useTripStore();
  const t = useTranslations('Hotel');
  
  // Read hotel stops directly from global waypoints
  const stops = waypoints.filter(wp => wp.type === 'stop' && wp.id.startsWith('hotel-'));

  return (
    <div className="flex-1 flex flex-col space-y-4">
      <div className="pt-2 space-y-6">
        
        {/* Preferences Control */}
        <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings2 className="w-4 h-4 text-white/50" />
            <span className="font-medium text-sm text-white/80">{t('stopsSettings')}</span>
          </div>
          
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center gap-3">
              <Label className="text-white/70 flex-1">{t('stopEveryHours')}</Label>
              <select 
                value={customTime ? String(customTime / 60) : "0"} 
                onChange={(e) => {
                  const num = Number(e.target.value);
                  setHotelSettings('time', num > 0 ? num * 60 : 0, customDistance);
                }}
                className="w-32 bg-[#131620] border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-white/30 appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='rgba(255, 255, 255, 0.5)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9' /%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
              >
                <option value="0" className="bg-[#131620]">{t('noStops')}</option>
                <option value="4" className="bg-[#131620]">{t('hoursOptions.4')}</option>
                <option value="6" className="bg-[#131620]">{t('hoursOptions.6')}</option>
                <option value="8" className="bg-[#131620]">{t('hoursOptions.8')}</option>
                <option value="10" className="bg-[#131620]">{t('hoursOptions.10')}</option>
                <option value="12" className="bg-[#131620]">{t('hoursOptions.12')}</option>
                <option value="14" className="bg-[#131620]">{t('hoursOptions.14')}</option>
                <option value="16" className="bg-[#131620]">{t('hoursOptions.16')}</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-white/70 flex-1">{t('orEveryKm')}</Label>
              <Input 
                type="number" 
                min={0} 
                max={2000} 
                value={customDistance || ""} 
                placeholder={t('noStops')}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setHotelSettings('distance', customTime, val);
                }}
                className="w-32"
              />
            </div>
          </div>
        </div>

        {/* Results / Stops Render */}
        <div className="space-y-4">
          {mode === 'ignore' ? (
            <div className="p-8 text-center text-white/50 bg-white/5 rounded-xl border border-white/10 border-dashed">
              <BedDouble className="w-8 h-8 mx-auto mb-2 text-white/30" />
              <p>{t('noOvernightNotice')}</p>
            </div>
          ) : stops.length === 0 ? (
            <div className="p-8 text-center text-white/50 bg-white/5 rounded-xl border border-white/10 border-dashed">
              <BedDouble className="w-8 h-8 mx-auto mb-2 text-white/30" />
              <p>{t('noExtraOvernightNotice')}</p>
            </div>
          ) : (
            (() => {
              const activeStops = stops.filter(wp => isHotelActive(wp.id, customTime, hotelOverrides));
              const hasAnyHotelOverride = activeStops.some(wp => hotelOverrides[wp.id]?.priceEur !== undefined);
              
              return stops.map(stop => {
                const override = hotelOverrides[stop.id];
                const isSkipped = !isHotelActive(stop.id, customTime, hotelOverrides);
                const priceEur = override?.priceEur !== undefined 
                  ? override.priceEur 
                  : (hasAnyHotelOverride ? 0 : getHotelPrice(stop.countryCode || 'UNKNOWN'));
                const priceLocal = Math.round(priceEur * (exchangeRates[currency] || 1));
                
                return (
                <div key={stop.id} className={`rounded-xl border border-white/10 p-5 space-y-3 transition-colors shadow-sm ${isSkipped ? 'bg-white/5 opacity-50' : 'bg-white/10 hover:border-amber-500/50'}`}>
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-white/90 text-lg">
                        <MapPin className="w-4 h-4 text-amber-500" />
                        {override?.url ? (
                          <a href={override.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                            {stop.name} <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          stop.name
                        )}
                      </div>
                      <p className="text-sm text-white/50 mt-1">
                        {t('approxArrival')} {Math.floor(stop.timeFromStart / 60)} {t('hoursShort')} {stop.timeFromStart % 60} {t('minutesShort')}
                      </p>
                      <p className="text-xs text-white/40 mt-1">
                        {t('distanceFromStart')} {stop.distanceFromStart} {t('kmShort')}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <div className="text-right bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                        <span className="text-xs text-white/50 block">
                          {isSkipped ? t('notIncluded') : (override?.priceEur !== undefined ? t('exactPrice') : t('averagePrice'))}
                        </span>
                        <span className={`text-sm font-bold ${isSkipped ? 'text-white/40' : 'text-amber-400'}`}>
                          {override?.priceEur !== undefined ? "" : t('from') + " "}{priceLocal} {currency} {t('perNight')}
                        </span>
                      </div>
                      <button
                        onClick={() => setHotelOverride(stop.id, { skipped: !isSkipped })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isSkipped 
                            ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
                            : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/90'
                        }`}
                      >
                        {isSkipped ? t('activateOvernight') : t('ignoreOvernight')}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Stay22Map lat={stop.lat} lon={stop.lon} address={stop.name.replace(/^(Ночівля|Overnight stay)[:\s]+(?:у м\.\s*)?/i, '')} />
                </div>
              </div>
            );
          })})()
          )}
        </div>
        
      </div>
    </div>
  );
}
