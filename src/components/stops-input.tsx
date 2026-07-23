"use client";

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { useState, useEffect, useRef } from 'react';
import { MapPin, X, Loader2, LocateFixed, ArrowUpDown, PlusCircle, ArrowRight } from "lucide-react";
import { useTripStore } from "@/store/useTripStore";
import { MapPickerModal } from "./MapPickerModal";
import { useDebounce } from "@/hooks/use-debounce";

interface SortableItemProps {
  id: string;
  realId: string;
  value: string;
  index: number;
  isLast: boolean;
  totalStops: number;
  updateStop: (id: string, value: string) => void;
  removeStop: (id: string) => void;
  onSwap: () => void;
}

function SortableItem({ id, realId, value, index, isLast, totalStops, updateStop, removeStop, onSwap }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: showSuggestions ? 9999 : (100 - index) };
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedValue = useDebounce(value, 400);

  useEffect(() => {
    if (debouncedValue && debouncedValue.length > 2 && showSuggestions && !debouncedValue.includes('|') && !debouncedValue.includes('waze.com') && !debouncedValue.includes('maps.google')) {
      setIsSearching(true);
      fetch(`/api/google/places?input=${encodeURIComponent(debouncedValue)}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'OK' && data.predictions) {
            const filtered = data.predictions.filter((p: any) => {
              const desc = p.description || "";
              return !/\b(Russia|Россия|Belarus|Беларусь|РФ|РБ)\b/i.test(desc) && 
                     !desc.endsWith("RU") && !desc.endsWith("BY");
            });
            setSuggestions(filtered.slice(0, 5).map((p: any) => ({
              id: p.place_id,
              name: p.structured_formatting.main_text,
              country: p.structured_formatting.secondary_text,
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
  }, [debouncedValue, showSuggestions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={setNodeRef} style={style} className={`relative ${showSuggestions ? 'z-50' : 'z-10'} mb-8`}>
      <div className="flex items-center gap-3 bg-white/5 border border-white/20 rounded-2xl p-3 pl-4 focus-within:border-white/40 focus-within:bg-white/10 transition-colors w-full group relative z-10 backdrop-blur-md">
        <div {...attributes} {...listeners} className="cursor-grab text-white/50 hover:text-white shrink-0 touch-none flex items-center justify-center">
          {index === 0 ? <LocateFixed className="w-5 h-5" /> : isLast ? <MapPin className="w-5 h-5" /> : <div className="w-2.5 h-2.5 rounded-full bg-white/70 ml-1.5" />}
        </div>
        <div className="flex-1 relative min-w-0 flex items-center group" ref={dropdownRef}>
          {!value && (
            <div className="absolute inset-0 flex items-center pointer-events-none text-white/40 text-sm font-medium z-0">
              <div className="w-full truncate group-focus-within:hidden">
                {index === 0 ? "Звідки" : isLast ? "Куди" : "Проміжна зупинка"}
              </div>
              <div className="w-full hidden group-focus-within:block truncate">
                {index === 0 ? "Звідки" : isLast ? "Куди" : "Проміжна зупинка"}
              </div>
            </div>
          )}
          <input 
            value={value.split(' | ')[0]}
            autoComplete="off"
            onChange={(e) => {
              updateStop(realId, e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className={`peer bg-transparent text-white text-sm font-medium w-full outline-none text-ellipsis relative z-10 ${index === 0 ? 'pr-8' : ''}`}
          />
          {index === 0 && (
            <button 
              type="button" 
              onClick={async (e) => {
                e.stopPropagation();
                if (!navigator.geolocation) {
                  alert("Геолокація не підтримується вашим браузером");
                  return;
                }
                navigator.geolocation.getCurrentPosition(async (position) => {
                  const { latitude, longitude } = position.coords;
                  try {
                    const res = await fetch(`/api/google/geocode?latlng=${latitude},${longitude}`);
                    const data = await res.json();
                    if (data.status === 'OK' && data.results && data.results.length > 0) {
                      const address = data.results[0].formatted_address;
                      updateStop(realId, `${address} | ${latitude}, ${longitude}`);
                    } else {
                      updateStop(realId, `Поточне місцезнаходження | ${latitude}, ${longitude}`);
                    }
                  } catch (e) {
                    updateStop(realId, `Поточне місцезнаходження | ${latitude}, ${longitude}`);
                  }
                }, (error) => {
                  console.warn("Geolocation error:", error.message || error.code);
                  alert("Не вдалося отримати доступ до вашої геопозиції");
                });
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-blue-400 transition-colors z-20 p-1"
              title="Моє місцезнаходження"
            >
              <LocateFixed className="w-4 h-4" />
            </button>
          )}
          {showSuggestions && (suggestions.length > 0 || isSearching) && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-[100] max-h-[250px] overflow-y-auto custom-scrollbar">
              {isSearching ? (
                <div className="p-3 text-sm text-white/50 flex items-center gap-2 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" /> Пошук...
                </div>
              ) : (
                suggestions.map((s) => (
                  <div 
                    key={s.id} 
                    className="p-3 hover:bg-white/10 cursor-pointer text-sm border-b border-white/10 last:border-0 transition-colors"
                    onClick={async () => {
                      updateStop(realId, s.description); // temporarily show name
                      setShowSuggestions(false);
                      try {
                        const res = await fetch(`/api/google/geocode?address=${encodeURIComponent(s.description)}`);
                        const data = await res.json();
                        if (data.status === 'OK' && data.results && data.results.length > 0) {
                          const location = data.results[0].geometry.location;
                          updateStop(realId, `${s.name}, ${s.country} | ${location.lat}, ${location.lng}`);
                        }
                      } catch (e) {
                        console.error('Failed to geocode selected place', e);
                      }
                    }}
                  >
                    <div className="font-medium text-white">{s.name}</div>
                    <div className="text-xs text-white/50 mt-0.5">{s.country}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        {index !== 0 && !isLast && (
          <button onClick={() => removeStop(realId)} className="shrink-0 text-white/30 hover:text-red-400 p-1 transition-colors" title="Видалити зупинку">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>


      
      {/* Swap Button */}
      {index === 0 && totalStops === 2 && (
        <button 
          onClick={onSwap} 
          className="absolute top-full -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-transparent flex items-center justify-center z-20 hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
          style={{ left: '26px', marginTop: '16px' }}
          title="Поміняти місцями"
        >
          <ArrowUpDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

const LoadingText = () => {
  const [step, setStep] = useState(0);
  const steps = ["Аналізуємо зупинки", "Будуємо маршрут", "Перевіряємо кордони", "Рахуємо пальне"];
  
  useEffect(() => {
    const int = setInterval(() => {
      setStep(s => Math.min(s + 1, steps.length - 1));
    }, 1200);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full relative overflow-hidden h-6">
      {steps.map((text, i) => (
        <div 
          key={text} 
          className={`absolute flex items-center gap-2 transition-all duration-500 ${i === step ? 'opacity-100 translate-y-0' : i < step ? 'opacity-0 -translate-y-full' : 'opacity-0 translate-y-full'}`}
        >
          <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <span>{text}...</span>
        </div>
      ))}
    </div>
  );
};

export function StopsInput({ idPrefix = "stops" }: { idPrefix?: string }) {
  const { stops, setStops, addStop, updateStop, removeStop, calculateRoute, isLoading, error, isCalculated, resetTrip } = useTripStore();
  const [activePickerStopId, setActivePickerStopId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requires 5px movement before drag starts, allows clicking inputs!
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const realActiveId = String(active.id).replace(`${idPrefix}-`, '');
      const realOverId = String(over.id).replace(`${idPrefix}-`, '');
      const visibleStops = stops.filter(s => !s.isBorderOverride);
      const borderStops = stops.filter(s => s.isBorderOverride);
      const oldIndex = visibleStops.findIndex((s) => s.id === realActiveId);
      const newIndex = visibleStops.findIndex((s) => s.id === realOverId);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newVisibleStops = arrayMove(visibleStops, oldIndex, newIndex);
        setStops([...newVisibleStops, ...borderStops]);
        if (isCalculated) {
           calculateRoute();
        }
      }
    }
  };

  const visibleStops = stops.filter(s => !s.isBorderOverride);

  const handleSwap = () => {
    if (visibleStops.length === 2) {
      const newStops = [
        { ...visibleStops[0], value: visibleStops[1].value },
        { ...visibleStops[1], value: visibleStops[0].value },
      ];
      setStops(newStops);
    }
  };

  return (
    <div className="flex flex-col">
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      >
        <SortableContext items={visibleStops.map(s => `${idPrefix}-${s.id}`)} strategy={verticalListSortingStrategy}>
          <div className="relative">
            {visibleStops.map((stop, index) => (
              <SortableItem 
                key={`${idPrefix}-${stop.id}`} 
                id={`${idPrefix}-${stop.id}`}
                realId={stop.id}
                value={stop.value} 
                index={index} 
                isLast={index === visibleStops.length - 1}
                totalStops={visibleStops.length}
                updateStop={updateStop}
                removeStop={removeStop}
                onSwap={handleSwap}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      <MapPickerModal 
        open={!!activePickerStopId} 
        onOpenChange={(open) => !open && setActivePickerStopId(null)} 
        onConfirm={(address) => {
          if (activePickerStopId) {
            updateStop(activePickerStopId, address);
            setActivePickerStopId(null);
          }
        }} 
      />
      
      <button onClick={addStop} className="flex items-center gap-3 text-white font-medium hover:text-white/80 transition-colors text-sm py-2 outline-none pl-4 -mt-2 relative z-10 w-fit">
        <div className="w-5 h-5 flex items-center justify-center shrink-0">
          <PlusCircle className="w-5 h-5 text-white/50" />
        </div>
        Додати зупинку
      </button>

      <div className="pt-6">
        {error && <div className="text-sm text-red-400 font-medium mb-3 bg-red-900/30 p-3 rounded-lg border border-red-500/30">{error}</div>}
        {!isCalculated ? (
          <button onClick={calculateRoute} disabled={isLoading} className="w-full bg-white text-slate-900 hover:bg-slate-100 rounded-full py-4 font-bold text-base shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2 outline-none overflow-hidden">
            {isLoading ? <LoadingText /> : (
              <>Побудувати маршрут</>
            )}
          </button>
        ) : (
          <div className="flex gap-4">
            <button onClick={calculateRoute} disabled={isLoading} className="flex-1 bg-white text-slate-900 hover:bg-slate-100 rounded-full py-4 font-bold text-base shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2 outline-none overflow-hidden">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-900" /> : (
                <>Оновити</>
              )}
            </button>
            <button onClick={resetTrip} className="px-6 bg-white/10 text-white hover:bg-white/20 border border-white/20 rounded-full py-4 font-bold text-base transition-colors outline-none">
              Скинути
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
