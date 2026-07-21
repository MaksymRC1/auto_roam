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
          <div className="grid grid-cols-1 gap-4">
            
            {/* Green Card */}
            <div className="rounded-xl border border-white/10 p-5 bg-white/5 shadow-sm flex flex-col md:flex-row gap-4 md:items-center">
              <div className="p-3 bg-emerald-500/20 rounded-xl shrink-0 self-start md:self-auto">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white/90 text-base">Зелена картка (Міжнародне автострахування)</h4>
                <p className="text-sm text-white/70 mt-1 leading-relaxed">
                  Обов'язковий страховий сертифікат для виїзду за кордон на власному авто. Забезпечує відшкодування збитків третім особам у разі ДТП. Без цього документа перетин кордону на авто неможливий.
                </p>
              </div>
              <div className="shrink-0 pt-2 md:pt-0">
                <a href="https://hotline.finance/ua/green-card?utm_source=postaffiliatepro&utm_medium=cpa&utm_campaign=628r4tmflyrm0&a_aid=628r4tmflyrm0&a_bid=e55516d5" target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                  Дізнатися більше <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Travel Insurance */}
            <div className="rounded-xl border border-white/10 p-5 bg-white/5 shadow-sm flex flex-col md:flex-row gap-4 md:items-center">
              <div className="p-3 bg-blue-500/20 rounded-xl shrink-0 self-start md:self-auto">
                <Plane className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white/90 text-base">Туристичне страхування (Медичне)</h4>
                <p className="text-sm text-white/70 mt-1 leading-relaxed">
                  Медичний захист за кордоном, який покриває витрати на лікування, невідкладну допомогу та ліки. Наполегливо рекомендується мати всім пасажирам для уникнення величезних рахунків за медичні послуги в Європі.
                </p>
              </div>
              <div className="shrink-0 pt-2 md:pt-0">
                <a href="https://hotline.finance/ua/insurance-travel?utm_source=postaffiliatepro&utm_medium=cpa&utm_campaign=628r4tmflyrm0&a_aid=628r4tmflyrm0" target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                  Дізнатися більше <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* OSAGO */}
            <div className="rounded-xl border border-white/10 p-5 bg-white/5 shadow-sm flex flex-col md:flex-row gap-4 md:items-center">
              <div className="p-3 bg-amber-500/20 rounded-xl shrink-0 self-start md:self-auto">
                <Car className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white/90 text-base">Автоцивілка (ОСЦПВ)</h4>
                <p className="text-sm text-white/70 mt-1 leading-relaxed">
                  Обов'язкове страхування відповідальності водіїв на території України. Якщо ви плануєте подорожувати також і по Україні, переконайтеся, що ваш поточний поліс дійсний.
                </p>
              </div>
              <div className="shrink-0 pt-2 md:pt-0">
                <a href="https://hotline.finance/ua/osago?utm_source=postaffiliatepro&utm_medium=cpa&utm_campaign=628r4tmflyrm0&a_aid=628r4tmflyrm0&a_bid=562129" target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                  Дізнатися більше <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Accident Insurance */}
            <div className="rounded-xl border border-white/10 p-5 bg-white/5 shadow-sm flex flex-col md:flex-row gap-4 md:items-center">
              <div className="p-3 bg-purple-500/20 rounded-xl shrink-0 self-start md:self-auto">
                <HeartPulse className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white/90 text-base">Страхування від нещасних випадків</h4>
                <p className="text-sm text-white/70 mt-1 leading-relaxed">
                  Забезпечує фінансову підтримку та додатковий захист у разі непередбачуваних ситуацій зі здоров'ям під час поїздок та активного відпочинку.
                </p>
              </div>
              <div className="shrink-0 pt-2 md:pt-0">
                <a href="https://hotline.finance/ua/accidents?utm_source=postaffiliatepro&utm_medium=cpa&utm_campaign=628r4tmflyrm0&a_aid=628r4tmflyrm0" target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                  Дізнатися більше <ExternalLink className="w-4 h-4" />
                </a>
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
