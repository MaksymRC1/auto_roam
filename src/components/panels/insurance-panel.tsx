"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
    <Card className="flex-1 flex flex-col m-0 border-indigo-100 shadow-sm">
      <CardHeader className="bg-indigo-50/50 pb-4 border-b">
        <CardTitle className="text-xl flex items-center gap-2">
          <span>🛡️</span> Страхування та віньєтки
        </CardTitle>
        <CardDescription>
          Обов'язкове страхування авто та дорожні збори на вашому маршруті.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6 bg-white">
        
        {/* Insurance Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            Зелена картка (Міжнародне страхування)
          </h3>
          <div className="rounded-xl border p-5 bg-white shadow-sm border-slate-200">
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="p-3 bg-emerald-100 rounded-full shrink-0">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-700">
                  Для виїзду за кордон на автомобілі <strong>обов'язково</strong> потрібен міжнародний страховий сертифікат «Зелена картка». Він покриває вашу відповідальність перед третіми особами у разі ДТП за кордоном.
                </p>
                <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100 text-sm text-amber-800 space-y-2">
                  <p className="flex gap-2 items-start">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /> 
                    <span>Поліс має бути дійсним на весь період перебування за кордоном (мінімум 15 днів).</span>
                  </p>
                  <p className="flex gap-2 items-start">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /> 
                    <span>Рекомендується мати видруковану копію поліса, хоча електронний формат також допускається.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tolls & Vignettes Section */}
        {activeVignettes.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              Дорожні збори та віньєтки
            </h3>
            
            {activeVignettes.map((vignette, idx) => (
              <div key={idx} className="rounded-xl border p-4 bg-slate-50 shadow-sm border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="text-3xl leading-none">{vignette.emoji}</div>
                  <div>
                    <p className="font-bold text-slate-800">{vignette.country}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                      <Route className="w-3 h-3" /> {vignette.notes || 'Національні дороги'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                  <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 self-start md:self-auto">
                    {vignette.type}
                  </span>
                  <Button size="sm" variant="outline" className="w-full md:w-auto text-indigo-700 border-indigo-200 hover:bg-indigo-50" onClick={() => window.open(vignette.link, "_blank")}>
                    Купити офіційно <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

      </CardContent>
    </Card>
  );
}
