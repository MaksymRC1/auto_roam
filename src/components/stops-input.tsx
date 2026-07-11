import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation2, GripVertical, X, Plus, Map as MapIcon, Loader2 } from "lucide-react";
import { useTripStore } from "@/store/useTripStore";
import { MapPickerModal } from "./MapPickerModal";
import { useDebounce } from "@/hooks/use-debounce";

function SortableItem({ id, value, index, isLast, updateStop, removeStop, openMapPicker }: any) {
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
              // Consider European if timezone is Europe/* or it's one of the transcontinental/edge countries
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

  // Click outside to close
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
    <div ref={setNodeRef} style={style} className={`flex items-center gap-2 mb-2 bg-white relative ${showSuggestions ? 'z-50' : 'z-10'}`}>
      <div {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-600 touch-none">
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
        {index === 0 ? <MapPin className="w-4 h-4 text-emerald-600" /> : isLast ? <Navigation2 className="w-4 h-4 text-rose-600" /> : <div className="w-3 h-3 rounded-full bg-blue-500" />}
      </div>
      <div className="flex-1 flex items-center gap-1 w-full relative" ref={dropdownRef}>
        <Input 
          placeholder={index === 0 ? "Звідки (місто або посилання Maps/Waze)" : isLast ? "Куди (місто або посилання Maps/Waze)" : "Проміжна зупинка (місто або посилання)"}
          value={value}
          autoComplete="off"
          onChange={(e) => {
            updateStop(id, e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          className="bg-slate-50 border-slate-200 focus-visible:ring-blue-500 w-full"
        />
        {showSuggestions && (suggestions.length > 0 || isSearching) && (
          <div className="absolute top-full left-0 right-10 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-[100] max-h-[250px] overflow-y-auto">
            {isSearching ? (
              <div className="p-3 text-sm text-slate-500 flex items-center gap-2 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> Пошук...
              </div>
            ) : (
              suggestions.map((s) => (
                <div 
                  key={s.id} 
                  className="p-2 px-3 hover:bg-slate-100 cursor-pointer text-sm border-b last:border-0"
                  onClick={() => {
                    updateStop(id, `${s.name}, ${s.country} | ${s.latitude}, ${s.longitude}`);
                    setShowSuggestions(false);
                  }}
                >
                  <div className="font-medium text-slate-800">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.admin1 ? `${s.admin1}, ` : ''}{s.country}</div>
                </div>
              ))
            )}
          </div>
        )}
        <Button variant="ghost" size="icon" className="shrink-0 text-slate-400 hover:text-blue-600" onClick={() => openMapPicker(id)} title="Обрати на карті">
          <MapIcon className="w-4 h-4" />
        </Button>
      </div>
      {index !== 0 && !isLast && (
        <Button variant="ghost" size="icon" onClick={() => removeStop(id)} className="shrink-0 text-slate-400 hover:text-red-500">
          <X className="w-4 h-4" />
        </Button>
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

  return (
    <div className="space-y-3">
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      >
        <SortableContext items={visibleStops.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {visibleStops.map((stop, index) => (
              <SortableItem 
                key={stop.id} 
                id={stop.id} 
                value={stop.value} 
                index={index} 
                isLast={index === visibleStops.length - 1}
                updateStop={updateStop}
                removeStop={removeStop}
                openMapPicker={(id: string) => setActivePickerStopId(id)}
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
      
      <Button variant="ghost" onClick={addStop} className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 justify-start gap-2">
        <Plus className="w-4 h-4" /> Додати зупинку
      </Button>

      <div className="pt-2">
        {error && <div className="text-sm text-red-500 font-medium mb-3">{error}</div>}
        {!isCalculated ? (
          <Button onClick={calculateRoute} disabled={isLoading} size="lg" className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm text-base">
            {isLoading ? <div className="loader-white"></div> : 'Побудувати маршрут'}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={calculateRoute} disabled={isLoading} size="lg" className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-sm text-base">
              {isLoading ? <div className="loader-white"></div> : 'Оновити'}
            </Button>
            <Button onClick={resetTrip} variant="outline" size="lg" className="flex-1 text-slate-600 border-slate-300">
              Скинути
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
