"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTripStore } from "@/store/useTripStore";
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
      <div className="flex items-center justify-between bg-blue-50 text-blue-800 text-xs p-3 rounded-lg border border-blue-100">
        <p>💡 <b>Знайшли ідеальний готель на мапі?</b> Оскільки це зовнішній сервіс, натисніть <b>«Змінити»</b> у Таймлайні ліворуч, щоб вручну вписати його назву та ціну для точного кошторису.</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsOpen(false)}
          className="h-7 text-xs shrink-0 ml-3 bg-white hover:bg-slate-100"
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
    <Card className="flex-1 flex flex-col m-0 border-amber-100 shadow-sm">
      <CardHeader className="bg-amber-50/50 pb-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <span>🏨</span> Ночівля та зупинки
          </CardTitle>
        </div>
        <CardDescription>
          Налаштуйте інтервали зупинок або довіртеся автоматичним рекомендаціям.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6 bg-white">
        
        {/* Preferences Control */}
        <div className="bg-slate-50 p-4 rounded-lg border space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings2 className="w-4 h-4 text-slate-500" />
            <span className="font-medium text-sm text-slate-700">Налаштування зупинок</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button 
              variant={mode === 'auto' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setHotelSettings('auto')}
              className={mode === 'auto' ? 'bg-amber-500 hover:bg-amber-600' : ''}
            >
              Авто (&gt; 8 год)
            </Button>
            <Button 
              variant={mode === 'time' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setHotelSettings('time')}
              className={mode === 'time' ? 'bg-amber-500 hover:bg-amber-600' : ''}
            >
              По часу
            </Button>
            <Button 
              variant={mode === 'distance' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setHotelSettings('distance')}
              className={mode === 'distance' ? 'bg-amber-500 hover:bg-amber-600' : ''}
            >
              По відстані
            </Button>
            <Button 
              variant={mode === 'ignore' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setHotelSettings('ignore')}
              className={mode === 'ignore' ? 'bg-slate-600 hover:bg-slate-700' : ''}
            >
              Ігнорувати
            </Button>
          </div>

          {/* Custom Value Inputs */}
          {mode === 'time' && (
            <div className="flex items-center gap-3 pt-2">
              <Label className="text-slate-600">Зупинятися кожні (годин):</Label>
              <Input 
                type="number" 
                min={1} 
                max={24} 
                value={customTime / 60} 
                onChange={(e) => setHotelSettings('time', Number(e.target.value) * 60, customDistance)}
                className="w-24 bg-white"
              />
            </div>
          )}
          {mode === 'distance' && (
            <div className="flex items-center gap-3 pt-2">
              <Label className="text-slate-600">Зупинятися кожні (км):</Label>
              <Input 
                type="number" 
                min={50} 
                max={2000} 
                value={customDistance} 
                onChange={(e) => setHotelSettings('distance', customTime, Number(e.target.value))}
                className="w-24 bg-white"
              />
            </div>
          )}
        </div>

        {/* Results / Stops Render */}
        <div className="space-y-4">
          {mode === 'ignore' ? (
            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed">
              <BedDouble className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>Ви обрали проїхати маршрут без тривалих зупинок.</p>
            </div>
          ) : stops.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed">
              <BedDouble className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>За поточними налаштуваннями додаткова ночівля не потрібна.</p>
            </div>
          ) : (
            stops.map(stop => {
              const { getHotelPrice } = require('@/store/useTripStore');
              const override = hotelOverrides[stop.id];
              const priceEur = override?.priceEur !== undefined ? override.priceEur : getHotelPrice(stop.countryCode || 'UNKNOWN');
              const priceLocal = Math.round(priceEur * exchangeRates[currency]);
              
              return (
              <div key={stop.id} className="rounded-xl border p-5 space-y-3 bg-slate-50 hover:border-amber-300 transition-colors shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 text-lg">
                      <MapPin className="w-4 h-4 text-amber-500" />
                      {override?.url ? (
                        <a href={override.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                          {stop.name} <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        stop.name
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      Орієнтовне прибуття через {Math.floor(stop.timeFromStart / 60)} год {stop.timeFromStart % 60} хв
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Відстань від старту: {stop.distanceFromStart} км
                    </p>
                  </div>
                  <div className="text-right bg-white px-3 py-1.5 rounded-lg border">
                    <span className="text-xs text-slate-500 block">Середня ціна</span>
                    <span className="text-sm font-bold text-amber-600">від {priceLocal} {currency} / ніч</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Stay22Map lat={stop.lat} lon={stop.lon} address={stop.name.replace('Ночівля у м. ', '')} />
                </div>
              </div>
            )})
          )}
        </div>
        
      </CardContent>
    </Card>
  );
}
