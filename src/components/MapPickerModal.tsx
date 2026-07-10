"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { reverseGeocode } from "@/lib/routing";

const DynamicMapPicker = dynamic(() => import("./MapPickerContent"), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-slate-100 animate-pulse text-slate-400">Завантаження карти...</div>
});

export function MapPickerModal({ 
  open, 
  onOpenChange, 
  onConfirm 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onConfirm: (address: string) => void;
}) {
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedPos) return;
    setIsLoading(true);
    try {
      const geo = await reverseGeocode(selectedPos[0], selectedPos[1]);
      const cityName = geo?.city || "Точка на карті";
      // Format: "CityName | lat,lon" so that we can easily parse exact coordinates later
      const finalValue = `${cityName} | ${selectedPos[0].toFixed(5)},${selectedPos[1].toFixed(5)}`;
      onConfirm(finalValue);
    } catch (e) {
      console.error(e);
      onConfirm(`Точка на карті | ${selectedPos[0].toFixed(5)},${selectedPos[1].toFixed(5)}`);
    } finally {
      setIsLoading(false);
      onOpenChange(false);
      setSelectedPos(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col p-4 w-[95vw] max-w-none sm:w-full">
        <DialogHeader>
          <DialogTitle>Оберіть точку на карті</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 border rounded-md relative z-0">
          <DynamicMapPicker selectedPos={selectedPos} onSelect={setSelectedPos} />
        </div>
        <DialogFooter className="mt-4 flex sm:justify-between items-center gap-4">
          <p className="text-sm text-slate-500 hidden sm:block">
            {selectedPos ? `Обрано: ${selectedPos[0].toFixed(4)}, ${selectedPos[1].toFixed(4)}` : "Клікніть на карту, щоб обрати точку"}
          </p>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => onOpenChange(false)}>Скасувати</Button>
            <Button className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white" onClick={handleConfirm} disabled={!selectedPos || isLoading}>
              {isLoading ? "Завантаження..." : "Підтвердити"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
