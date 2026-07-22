"use client";

import { Button } from "@/components/ui/button";
import { useTripStore } from "@/store/useTripStore";
import { ExternalLink, AlertTriangle, Info, Clock, ShieldCheck } from "lucide-react";
import { isSchengenPair } from "@/lib/borders";


export function BordersPanel({ selectedBorderId }: { selectedBorderId?: string }) {
  const { waypoints } = useTripStore();
  let borderCrossings = waypoints.filter(wp => wp.type === 'border');
  
  if (selectedBorderId) {
    borderCrossings = borderCrossings.filter(wp => wp.id === selectedBorderId);
  }
  
  if (borderCrossings.length === 0) {
    return (
      <div className="flex-1 flex flex-col p-8 text-center text-white/50 border border-white/10 rounded-xl bg-white/5">
        <Info className="w-8 h-8 mx-auto mb-2 text-white/30" />
        <p>Ваш маршрут не перетинає державних кордонів з контролем.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col space-y-4">
      <div className="pt-2 space-y-6">
        
        {/* Border Crossings Section */}
        <div className="space-y-4">
          {!selectedBorderId && (
            <h3 className="font-semibold text-white/90 flex items-center gap-2">
              Обрані пункти пропуску
            </h3>
          )}
          {borderCrossings.map(border => (
            <div key={border.id} className="rounded-xl border border-white/10 p-5 bg-white/5 shadow-sm hover:border-indigo-400/50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 font-bold text-white/90 text-lg">
                    {border.name}
                  </div>
                  <p className="text-sm text-white/50 mt-1">
                    Приблизне прибуття через {Math.floor(border.timeFromStart / 60)} год {border.timeFromStart % 60} хв
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10 text-sm text-white/70 space-y-2">
                {border.fromCountry && border.toCountry && isSchengenPair(border.fromCountry, border.toCountry) ? (
                  <p className="flex gap-2 text-blue-300">
                    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" /> 
                    Це внутрішній кордон Шенгенської зони. Перетин здійснюється без паспортного контролю.
                  </p>
                ) : (
                  <>
                    <p className="flex gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" /> 
                      Перевірте наявність біометричних закордонних паспортів та дійсних віз (якщо потрібно).
                    </p>
                    <p className="flex gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" /> 
                      Техпаспорт на авто та посвідчення водія міжнародного зразка є обов'язковими.
                    </p>
                    {border.name.includes('UA') && (
                      <p className="flex gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" /> 
                        Заборонено ввозити м'ясні та молочні продукти до країн ЄС.
                      </p>
                    )}
                  </>
                )}
              </div>

              {border.name.includes('UA') && (
                <div className="pt-4 flex gap-2">
                  <Button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm" onClick={() => window.open("https://dpsu.gov.ua/ua/map/", "_blank")}>
                    Перевірити черги на сайті ДПСУ <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
