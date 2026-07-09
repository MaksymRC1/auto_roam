import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation2, GripVertical, X, Plus } from "lucide-react";
import { useTripStore } from "@/store/useTripStore";

function SortableItem({ id, value, index, isLast, updateStop, removeStop }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 mb-2 bg-white relative z-10">
      <div {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-600 touch-none">
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
        {index === 0 ? <MapPin className="w-4 h-4 text-emerald-600" /> : isLast ? <Navigation2 className="w-4 h-4 text-rose-600" /> : <div className="w-3 h-3 rounded-full bg-blue-500" />}
      </div>
      <Input 
        placeholder={index === 0 ? "Звідки (напр. Київ)" : isLast ? "Куди (напр. Краків)" : "Проміжна зупинка"}
        value={value}
        onChange={(e) => updateStop(id, e.target.value)}
        className="bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
      />
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
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = stops.findIndex((s) => s.id === active.id);
      const newIndex = stops.findIndex((s) => s.id === over.id);
      const newStops = arrayMove(stops, oldIndex, newIndex);
      setStops(newStops);
      // Auto recalculate route on reorder if already calculated
      if (isCalculated) {
         calculateRoute();
      }
    }
  };

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={stops.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {stops.map((stop, index) => (
              <SortableItem 
                key={stop.id} 
                id={stop.id} 
                value={stop.value} 
                index={index} 
                isLast={index === stops.length - 1}
                updateStop={updateStop}
                removeStop={removeStop}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      <Button variant="ghost" onClick={addStop} className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 justify-start gap-2">
        <Plus className="w-4 h-4" /> Додати зупинку
      </Button>

      <div className="pt-2">
        {error && <div className="text-sm text-red-500 font-medium mb-3">{error}</div>}
        {!isCalculated ? (
          <Button onClick={calculateRoute} disabled={isLoading} size="lg" className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm text-base">
            {isLoading ? 'Розрахунок...' : 'Побудувати маршрут'}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={calculateRoute} disabled={isLoading} size="lg" className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-sm text-base">
              {isLoading ? 'Перерахунок...' : 'Оновити'}
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
