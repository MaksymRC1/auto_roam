import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { MapPin, Navigation2, GripVertical, X, Plus, Map as MapIcon, Loader2, LocateFixed, ArrowUpDown, PlusCircle, ArrowRight } from "lucide-react";
import { useTripStore } from "@/store/useTripStore";
import { MapPickerModal } from "./MapPickerModal";
import { useDebounce } from "@/hooks/use-debounce";

function SortableItem({ id, value, index, isLast, totalStops, updateStop, removeStop, openMapPicker, onSwap }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedValue = useDebounce(value, 400);

  useEffect(() => {
    if (debouncedValue && debouncedValue.length > 2 && showSuggestions && !debouncedValue.includes('|') && !debouncedValue.includes('waze.com') && !debouncedValue.includes('maps.google')) {
      setIsSearching(true);
      fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(debouncedValue)}&count=20&language=uk`)
        .then(res => res.json())
        .then(data => {
          if (data.results) {
            const filtered = data.results.filter((r: any) => {
              if (r.country_code === 'RU' || r.country_code === 'BY') return false;
              const isEurope = r.timezone?.startsWith('Europe/') || ['TR', 'CY', 'GE', 'AM', 'AZ'].includes(r.country_code);
              return isEurope;
            });
            setSuggestions(filtered.slice(0, 5));
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
        <div className="flex-1 relative" ref={dropdownRef}>
          <input 
            placeholder={index === 0 ? "Звідки (місто або посилання Maps/Waze)" : isLast ? "Куди (місто або посилання Maps/Waze)" : "Проміжна зупинка (місто або посилання)"}
            value={value}
            autoComplete="off"
            onChange={(e) => {
              updateStop(id, e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="bg-transparent text-white placeholder:text-white/40 text-sm font-medium w-full outline-none"
          />
          {showSuggestions && (suggestions.length > 0 || isSearching) && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-slate-800 border border-white/20 rounded-xl shadow-2xl z-[100] max-h-[250px] overflow-y-auto custom-scrollbar">
              {isSearching ? (
                <div className="p-3 text-sm text-white/50 flex items-center gap-2 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" /> Пошук...
                </div>
              ) : (
                suggestions.map((s) => (
                  <div 
                    key={s.id} 
                    className="p-3 hover:bg-white/10 cursor-pointer text-sm border-b border-white/10 last:border-0 transition-colors"
                    onClick={() => {
                      updateStop(id, `${s.name}, ${s.country} | ${s.latitude}, ${s.longitude}`);
                      setShowSuggestions(false);
                    }}
                  >
                    <div className="font-medium text-white">{s.name}</div>
                    <div className="text-xs text-white/50 mt-0.5">{s.admin1 ? `${s.admin1}, ` : ''}{s.country}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        {index !== 0 && !isLast && (
          <button onClick={() => removeStop(id)} className="shrink-0 text-white/30 hover:text-red-400 p-1 transition-colors" title="Видалити зупинку">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Gap Line */}
      {!isLast && (
        <div className="absolute top-full w-[1px] bg-white/20 z-0" style={{ left: '26px', height: '32px' }}></div>
      )}
      
      {/* Swap Button */}
      {index === 0 && totalStops === 2 && (
        <button 
          onClick={onSwap} 
          className="absolute top-full -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#202020] border border-white/20 flex items-center justify-center z-20 hover:bg-[#303030] transition-colors cursor-pointer shadow-md"
          style={{ left: '26px', marginTop: '16px' }}
          title="Поміняти місцями"
        >
          <ArrowUpDown className="w-4 h-4 text-white/70" />
        </button>
      )}
    </div>
  );
}

export function StopsInput() {
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

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const visibleStops = stops.filter(s => !s.isBorderOverride);
      const oldIndex = visibleStops.findIndex((s) => s.id === active.id);
      const newIndex = visibleStops.findIndex((s) => s.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newVisibleStops = arrayMove(visibleStops, oldIndex, newIndex);
        setStops(newVisibleStops); // This inherently clears border overrides because they aren't in visibleStops
        if (isCalculated) {
           calculateRoute();
        }
      }
    }
  };

  const visibleStops = stops.filter(s => !s.isBorderOverride);

  const handleSwap = () => {
    if (visibleStops.length === 2) {
      const newStops = [...visibleStops];
      const temp = newStops[0].value;
      newStops[0].value = newStops[1].value;
      newStops[1].value = temp;
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
        <SortableContext items={visibleStops.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="relative">
            {visibleStops.map((stop, index) => (
              <SortableItem 
                key={stop.id} 
                id={stop.id} 
                value={stop.value} 
                index={index} 
                isLast={index === visibleStops.length - 1}
                totalStops={visibleStops.length}
                updateStop={updateStop}
                removeStop={removeStop}
                openMapPicker={(id: string) => setActivePickerStopId(id)}
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
          <button onClick={calculateRoute} disabled={isLoading} className="w-full bg-white text-slate-900 hover:bg-slate-100 rounded-full py-4 font-bold text-base shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2 outline-none">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>Побудувати маршрут <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        ) : (
          <div className="flex gap-4">
            <button onClick={calculateRoute} disabled={isLoading} className="flex-1 bg-white text-slate-900 hover:bg-slate-100 rounded-full py-4 font-bold text-base shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2 outline-none">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>Оновити <ArrowRight className="w-5 h-5" /></>
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
