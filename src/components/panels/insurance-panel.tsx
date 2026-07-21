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
              Необхідні документи
            </h3>
            <p className="text-sm text-white/50 mt-1">
              Для безпечної подорожі та перетину кордону переконайтеся у наявності відповідних полісів.
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
                  Обов'язковий сертифікат для виїзду за кордон на авто, що покриває збитки третім особам у разі ДТП. Без нього перетин кордону неможливий. Ви можете швидко <a href="https://hotline.finance/ua/green-card?utm_source=postaffiliatepro&utm_medium=cpa&utm_campaign=628r4tmflyrm0&a_aid=628r4tmflyrm0&a_bid=e55516d5" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2">оформити поліс онлайн</a> перед поїздкою.
                </p>
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
                  Медичний захист за кордоном, який покриває витрати на лікування та невідкладну допомогу. Наполегливо рекомендується всім пасажирам. <a href="https://hotline.finance/ua/insurance-travel?utm_source=postaffiliatepro&utm_medium=cpa&utm_campaign=628r4tmflyrm0&a_aid=628r4tmflyrm0" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2">Зробити туристичну страховку</a> можна за кілька кліків.
                </p>
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
                  Обов'язкове страхування відповідальності на території України. Якщо ви плануєте пересуватися Україною, переконайтеся, що ваш поліс дійсний, або ж <a href="https://hotline.finance/ua/osago?utm_source=postaffiliatepro&utm_medium=cpa&utm_campaign=628r4tmflyrm0&a_aid=628r4tmflyrm0&a_bid=562129" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2">оновіть його онлайн</a>.
                </p>
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
                  Забезпечує додатковий захист у разі непередбачуваних ситуацій під час активного відпочинку. <a href="https://hotline.finance/ua/accidents?utm_source=postaffiliatepro&utm_medium=cpa&utm_campaign=628r4tmflyrm0&a_aid=628r4tmflyrm0" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2">Оформити страхування</a> можна за лічені хвилини.
                </p>
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
