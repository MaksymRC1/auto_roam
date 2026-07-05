"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTripStore } from "@/store/useTripStore";
import { BedDouble, ExternalLink, MapPin, Settings2 } from "lucide-react";

type StopMode = 'auto' | 'time' | 'distance' | 'ignore';

export function HotelPanel() {
  const { waypoints, totalDuration, totalDistance } = useTripStore();
  
  // Local state for customization
  const [mode, setMode] = useState<StopMode>('auto');
  const [customTime, setCustomTime] = useState<number>(6); // hours
  const [customDistance, setCustomDistance] = useState<number>(500); // km

  // Generate stops based on user preference
  let stops: Array<{id: string, name: string, timeFromStart: number, distanceFromStart: number}> = [];
  
  if (mode === 'auto') {
    // Default logic: suggest if > 8 hours
    if (totalDuration > 480) {
      stops = waypoints.filter(wp => wp.type === 'stop');
    }
  } else if (mode === 'time') {
    if (customTime > 0) {
      const stopsCount = Math.floor(totalDuration / (customTime * 60));
      for (let i = 1; i <= stopsCount; i++) {
        // Prevent adding a stop exactly at the finish
        if (i * customTime * 60 >= totalDuration - 30) continue; 
        
        stops.push({
          id: `dyn-time-${i}`,
          name: `Рекомендована зупинка ${i}`,
          timeFromStart: i * customTime * 60,
          distanceFromStart: Math.round((totalDistance / totalDuration) * (i * customTime * 60))
        });
      }
    }
  } else if (mode === 'distance') {
    if (customDistance > 0) {
      const stopsCount = Math.floor(totalDistance / customDistance);
      for (let i = 1; i <= stopsCount; i++) {
        // Prevent adding a stop exactly at the finish
        if (i * customDistance >= totalDistance - 20) continue;

        stops.push({
          id: `dyn-dist-${i}`,
          name: `Рекомендована зупинка ${i}`,
          distanceFromStart: i * customDistance,
          timeFromStart: Math.round((totalDuration / totalDistance) * (i * customDistance))
        });
      }
    }
  }

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
              onClick={() => setMode('auto')}
              className={mode === 'auto' ? 'bg-amber-500 hover:bg-amber-600' : ''}
            >
              Авто (&gt; 8 год)
            </Button>
            <Button 
              variant={mode === 'time' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setMode('time')}
              className={mode === 'time' ? 'bg-amber-500 hover:bg-amber-600' : ''}
            >
              По часу
            </Button>
            <Button 
              variant={mode === 'distance' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setMode('distance')}
              className={mode === 'distance' ? 'bg-amber-500 hover:bg-amber-600' : ''}
            >
              По відстані
            </Button>
            <Button 
              variant={mode === 'ignore' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setMode('ignore')}
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
                value={customTime} 
                onChange={(e) => setCustomTime(Number(e.target.value))}
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
                onChange={(e) => setCustomDistance(Number(e.target.value))}
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
            stops.map(stop => (
              <div key={stop.id} className="rounded-xl border p-5 space-y-3 bg-slate-50 hover:border-amber-300 transition-colors shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 text-lg">
                      <MapPin className="w-4 h-4 text-amber-500" />
                      {stop.name}
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
                    <span className="text-sm font-bold text-emerald-600">від $45 / ніч</span>
                  </div>
                </div>
                
                <div className="pt-3 flex gap-2">
                  <Button className="w-full bg-[#003580] hover:bg-[#00224f] text-white" asChild>
                    <a href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(stop.name.replace('Ночівля у м. ', ''))}`} target="_blank" rel="noopener noreferrer">
                      Знайти готелі на Booking.com <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        
      </CardContent>
    </Card>
  );
}
