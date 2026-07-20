"use client";

import { Button } from "@/components/ui/button";
import { useTripStore } from "@/store/useTripStore";
import { ExternalLink, ShieldCheck, Route, Plane, Car, HeartPulse } from "lucide-react";
import { VIGNETTE_DB } from "@/lib/borders";

import { CURRENCY_SYMBOLS } from "@/lib/constants";

export function InsurancePanel() {
  const { crossedCountries, currency, exchangeRates } = useTripStore();
  
  // Find which countries from our trip need vignettes
  const activeVignettes = crossedCountries
    .map(code => VIGNETTE_DB[code])
    .filter(Boolean);

  return (
    <div className="flex-1 flex flex-col space-y-4">
      <div className="pt-2 space-y-6">
        
        {/* Insurance Section */}
        <div className="space-y-4">
          <div className="flex flex-col">
            <h3 className="font-semibold text-white/90 flex items-center gap-2">
              Рекомендоване страхування
            </h3>
            <p className="text-sm text-white/50 mt-1">
              Оформлюйте поліси онлайн за кілька хвилин зі знижками від нашого партнера.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Green Card */}
            <div className="rounded-xl border border-white/10 p-4 bg-white/5 hover:bg-white/10 transition-colors shadow-sm flex flex-col group cursor-pointer" onClick={() => window.open("https://hotline.finance/ua/green-card?utm_source=postaffiliatepro&utm_medium=cpa&utm_campaign=628r4tmflyrm0&a_aid=628r4tmflyrm0&a_bid=e55516d5", "_blank")}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white/90 text-sm leading-tight">Зелена картка</h4>
                  <p className="text-[10px] text-white/50 mt-0.5">Обов'язкова за кордоном</p>
                </div>
              </div>
              <p className="text-xs text-white/70 flex-1 mt-1 leading-snug">Міжнародний страховий сертифікат для вашого авто.</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] font-medium px-2 py-0.5 bg-white/10 rounded text-white/60 group-hover:bg-white/20 transition-colors">Електронний поліс</span>
                <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-emerald-400 transition-colors" />
              </div>
            </div>

            {/* Travel Insurance */}
            <div className="rounded-xl border border-white/10 p-4 bg-white/5 hover:bg-white/10 transition-colors shadow-sm flex flex-col group cursor-pointer" onClick={() => window.open("https://hotline.finance/ua/insurance-travel?utm_source=postaffiliatepro&utm_medium=cpa&utm_campaign=628r4tmflyrm0&a_aid=628r4tmflyrm0", "_blank")}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform">
                  <Plane className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white/90 text-sm leading-tight">Туристична страховка</h4>
                  <p className="text-[10px] text-white/50 mt-0.5">Медичний захист</p>
                </div>
              </div>
              <p className="text-xs text-white/70 flex-1 mt-1 leading-snug">Покриття медичних витрат під час подорожі.</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] font-medium px-2 py-0.5 bg-white/10 rounded text-white/60 group-hover:bg-white/20 transition-colors">Для всієї родини</span>
                <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-blue-400 transition-colors" />
              </div>
            </div>

            {/* OSAGO */}
            <div className="rounded-xl border border-white/10 p-4 bg-white/5 hover:bg-white/10 transition-colors shadow-sm flex flex-col group cursor-pointer" onClick={() => window.open("https://hotline.finance/ua/osago?utm_source=postaffiliatepro&utm_medium=cpa&utm_campaign=628r4tmflyrm0&a_aid=628r4tmflyrm0&a_bid=562129", "_blank")}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-500/20 rounded-xl group-hover:scale-110 transition-transform">
                  <Car className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white/90 text-sm leading-tight">Автоцивілка</h4>
                  <p className="text-[10px] text-white/50 mt-0.5">Для поїздок по Україні</p>
                </div>
              </div>
              <p className="text-xs text-white/70 flex-1 mt-1 leading-snug">ОСЦПВ (автоцивілка) зі знижками до 40%.</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] font-medium px-2 py-0.5 bg-white/10 rounded text-white/60 group-hover:bg-white/20 transition-colors">Миттєве оформлення</span>
                <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-amber-400 transition-colors" />
              </div>
            </div>

            {/* Accident Insurance */}
            <div className="rounded-xl border border-white/10 p-4 bg-white/5 hover:bg-white/10 transition-colors shadow-sm flex flex-col group cursor-pointer" onClick={() => window.open("https://hotline.finance/ua/accidents?utm_source=postaffiliatepro&utm_medium=cpa&utm_campaign=628r4tmflyrm0&a_aid=628r4tmflyrm0", "_blank")}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform">
                  <HeartPulse className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white/90 text-sm leading-tight">Від нещасних випадків</h4>
                  <p className="text-[10px] text-white/50 mt-0.5">Додатковий захист</p>
                </div>
              </div>
              <p className="text-xs text-white/70 flex-1 mt-1 leading-snug">Фінансова допомога при непередбачуваних ситуаціях.</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] font-medium px-2 py-0.5 bg-white/10 rounded text-white/60 group-hover:bg-white/20 transition-colors">Діє по всьому світу</span>
                <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-purple-400 transition-colors" />
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
                    {vignette.type} {vignette.priceEur > 0 && `(~${Math.round(vignette.priceEur * (exchangeRates[currency] || 1))} ${CURRENCY_SYMBOLS[currency] || currency})`}
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
