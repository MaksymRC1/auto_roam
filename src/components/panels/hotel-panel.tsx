"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTripStore, getHotelPrice } from "@/store/useTripStore";
import { BedDouble, ExternalLink, MapPin, Settings2, Map as MapIcon } from "lucide-react";

type StopMode = 'auto' | 'time' | 'distance' | 'ignore';

function Stay22Map({ lat, lon, address }: { lat?: number; lon?: number; address: string }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-sm transition-all"
      >
        <MapIcon className="w-4 h-4 mr-2" /> Знайти готелі та Airbnb на мапі (Stay22)
      </Button>
    );
  }

  // Use a generic placeholder 'autoroam' for Affiliate ID. The user can change this later.
  const src = `https://www.stay22.com/embed/gm?aid=autoroam&${lat && lon ? `lat=${lat}&lng=${lon}` : `address=${encodeURIComponent(address)}`}&maincolor=f59e0b`;

  return (
    <div className="w-full flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between bg-blue-500/10 text-blue-300 text-xs p-3 rounded-lg border border-blue-500/20">
        <p>💡 <b>Знайшли ідеальний готель на мапі?</b> Оскільки це зовнішній сервіс, натисніть <b>«Змінити»</b> у Таймлайні ліворуч, щоб вручну вписати його назву та ціну для точного кошторису.</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsOpen(false)}
          className="h-7 text-xs shrink-0 ml-3 bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          Сховати мапу
        </Button>
      </div>
      <div className="w-full h-[450px] rounded-lg overflow-hidden border border-amber-200 shadow-inner relative">
        <iframe
          src={src}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          title="Stay22 Interactive Map"
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
    hotelOverrides
  } = useTripStore();
  
  // Read hotel stops directly from global waypoints
  const stops = waypoints.filter(wp => wp.type === 'stop' && wp.id.startsWith('hotel-'));

  return (
    <div className="flex-1 flex flex-col space-y-4">
      <div className="pt-2 space-y-6">
        
        {/* Preferences Control */}
        <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings2 className="w-4 h-4 text-white/50" />
            <span className="font-medium text-sm text-white/80">Налаштування зупинок</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button 
              size="sm" 
              onClick={() => setHotelSettings('auto')}
              className={mode === 'auto' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'}
            >
              Авто (&gt; 8 год)
            </Button>
            <Button 
              size="sm" 
              onClick={() => setHotelSettings('time')}
              className={mode === 'time' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'}
            >
              По часу
            </Button>
            <Button 
              size="sm" 
              onClick={() => setHotelSettings('distance')}
              className={mode === 'distance' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'}
            >
              По відстані
            </Button>
            <Button 
              size="sm" 
              onClick={() => setHotelSettings('ignore')}
              className={mode === 'ignore' ? 'bg-white/20 border border-white/20 hover:bg-white/30 text-white' : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'}
            >
              Ігнорувати
            </Button>
          </div>

          {/* Custom Value Inputs */}
          {mode === 'time' && (
            <div className="flex items-center gap-3 pt-2">
              <Label className="text-white/70">Зупинятися кожні (годин):</Label>
              <Input 
                type="number" 
                min={1} 
                max={24} 
                value={customTime / 60} 
                onChange={(e) => setHotelSettings('time', Number(e.target.value) * 60, customDistance)}
                className="w-24"
              />
            </div>
          )}
          {mode === 'distance' && (
            <div className="flex items-center gap-3 pt-2">
              <Label className="text-white/70">Зупинятися кожні (км):</Label>
              <Input 
                type="number" 
                min={50} 
                max={2000} 
                value={customDistance} 
                onChange={(e) => setHotelSettings('distance', customTime, Number(e.target.value))}
                className="w-24"
              />
            </div>
          )}
        </div>

        {/* Results / Stops Render */}
        <div className="space-y-4">
          {mode === 'ignore' ? (
            <div className="p-8 text-center text-white/50 bg-white/5 rounded-xl border border-white/10 border-dashed">
              <BedDouble className="w-8 h-8 mx-auto mb-2 text-white/30" />
              <p>Ви обрали проїхати маршрут без тривалих зупинок.</p>
            </div>
          ) : stops.length === 0 ? (
            <div className="p-8 text-center text-white/50 bg-white/5 rounded-xl border border-white/10 border-dashed">
              <BedDouble className="w-8 h-8 mx-auto mb-2 text-white/30" />
              <p>За поточними налаштуваннями додаткова ночівля не потрібна.</p>
            </div>
          ) : (
            stops.map(stop => {
              const override = hotelOverrides[stop.id];
              const priceEur = override?.priceEur !== undefined ? override.priceEur : getHotelPrice(stop.countryCode || 'UNKNOWN');
              const priceLocal = Math.round(priceEur * (exchangeRates[currency] || 1));
              
              return (
              <div key={stop.id} className="rounded-xl border border-white/10 p-5 space-y-3 bg-white/5 hover:border-amber-500/50 transition-colors shadow-sm">
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
                      Орієнтовне прибуття через {Math.floor(stop.timeFromStart / 60)} год {stop.timeFromStart % 60} хв
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      Відстань від старту: {stop.distanceFromStart} км
                    </p>
                  </div>
                  <div className="text-right bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                    <span className="text-xs text-white/50 block">Середня ціна</span>
                    <span className="text-sm font-bold text-amber-400">від {priceLocal} {currency} / ніч</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Stay22Map lat={stop.lat} lon={stop.lon} address={stop.name.replace('Ночівля у м. ', '')} />
                </div>
              </div>
            )})
          )}
        </div>
        
      </div>
    </div>
  );
}
