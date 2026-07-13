"use client";

import { Button } from "@/components/ui/button";
import { useTripStore } from "@/store/useTripStore";
import { ExternalLink, ShieldCheck, Route, AlertTriangle } from "lucide-react";
import { VIGNETTE_DB } from "@/lib/borders";

export function InsurancePanel() {
  const { crossedCountries } = useTripStore();
  
  // Find which countries from our trip need vignettes
  const activeVignettes = crossedCountries
    .map(code => VIGNETTE_DB[code])
    .filter(Boolean);

  return (
    <div className="flex-1 flex flex-col space-y-4">
      <div className="pt-2 space-y-6">
        
        {/* Insurance Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-white/90 flex items-center gap-2">
            Зелена картка (Міжнародне страхування)
          </h3>
          <div className="rounded-xl border border-white/10 p-5 bg-white/5 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="p-3 bg-emerald-500/20 rounded-full shrink-0">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-white/70">
                  Для виїзду за кордон на автомобілі <strong>обов'язково</strong> потрібен міжнародний страховий сертифікат «Зелена картка». Він покриває вашу відповідальність перед третіми особами у разі ДТП за кордоном.
                </p>
                <div className="mt-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-sm text-amber-300 space-y-2">
                  <p className="flex gap-2 items-start">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> 
                    <span>Поліс має бути дійсним на весь період перебування за кордоном (мінімум 15 днів).</span>
                  </p>
                  <p className="flex gap-2 items-start">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> 
                    <span>Рекомендується мати видруковану копію поліса, хоча електронний формат також допускається.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tolls & Vignettes Section */}
        {activeVignettes.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="font-semibold text-white/90 flex items-center gap-2">
              Дорожні збори та віньєтки
            </h3>
            
            {activeVignettes.map((vignette, idx) => (
              <div key={idx} className="rounded-xl border border-white/10 p-4 bg-white/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="text-3xl leading-none">{vignette.emoji}</div>
                  <div>
                    <p className="font-bold text-white/90">{vignette.country}</p>
                    <p className="text-sm text-white/50 flex items-center gap-1 mt-0.5">
                      <Route className="w-3 h-3" /> {vignette.notes || 'Національні дороги'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                  <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 self-start md:self-auto">
                    {vignette.type}
                  </span>
                  <Button size="sm" variant="outline" className="w-full md:w-auto bg-white/5 border border-white/10 hover:bg-white/10 text-white" onClick={() => window.open(vignette.link, "_blank")}>
                    Купити офіційно <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
