"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTripStore } from "@/store/useTripStore";

export function FuelPanel() {
  const { totalDistance } = useTripStore();
  const consumption = 8; // l/100km mock
  const price = 55; // UAH mock
  
  const totalFuel = (totalDistance / 100) * consumption;
  const totalCost = totalFuel * price;

  return (
    <Card className="flex-1 flex flex-col m-0 border-blue-100 shadow-sm">
      <CardHeader className="bg-blue-50/50 pb-4 border-b">
        <CardTitle className="text-xl flex items-center gap-2">
          <span>⛽</span> Розрахунок палива
        </CardTitle>
        <CardDescription>
          Маршрут: {totalDistance} км. Автоматичний підрахунок витрат.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Витрата (л/100 км)</Label>
            <Input type="number" defaultValue={consumption} />
          </div>
          <div className="space-y-2">
            <Label>Середня ціна (₴/л)</Label>
            <Input type="number" defaultValue={price} />
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 p-4 space-y-2 border">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Потрібно палива:</span>
            <span className="font-semibold">{totalFuel.toFixed(1)} л</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span className="text-slate-700">Орієнтовна вартість:</span>
            <span className="text-blue-600">₴ {totalCost.toFixed(0)}</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 text-center">
          *Ціни базуються на середніх значеннях у країнах маршруту (Заглушка)
        </p>
      </CardContent>
    </Card>
  );
}
