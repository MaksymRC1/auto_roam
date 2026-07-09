"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTripStore } from "@/store/useTripStore";
import { ExternalLink, AlertTriangle, Info, Clock, Route } from "lucide-react";

const VIGNETTE_DB: Record<string, { country: string, emoji: string, type: string, link: string, notes?: string }> = {
  'PL': { country: 'Польща', emoji: '🇵🇱', type: 'Оплата на воротах / e-TOLL', link: 'https://etoll.gov.pl/ua/', notes: 'Автомагістралі A2, A4' },
  'RO': { country: 'Румунія', emoji: '🇷🇴', type: 'Електронна ровіньєтка', link: 'https://www.roviniete.ro/ru/', notes: 'Обов\'язкова на всіх національних дорогах' },
  'BG': { country: 'Болгарія', emoji: '🇧🇬', type: 'Електронна віньєтка (BG TOLL)', link: 'https://web.bgtoll.bg/', notes: 'Обов\'язкова на всіх національних дорогах' },
  'SK': { country: 'Словаччина', emoji: '🇸🇰', type: 'Електронна віньєтка', link: 'https://eznamka.sk/uk', notes: 'Обов\'язкова для автомагістралей' },
  'CZ': { country: 'Чехія', emoji: '🇨🇿', type: 'Електронна віньєтка', link: 'https://edalnice.cz/uk/', notes: 'Обов\'язкова для автомагістралей' },
  'HU': { country: 'Угорщина', emoji: '🇭🇺', type: 'Електронна віньєтка (e-matrica)', link: 'https://ematrica.nemzetiutdij.hu/', notes: 'Обов\'язкова для автомагістралей' },
  'AT': { country: 'Австрія', emoji: '🇦🇹', type: 'Віньєтка (ASFINAG)', link: 'https://shop.asfinag.at/uk/', notes: 'Обов\'язкова для автомагістралей. Є цифрова версія.' },
  'CH': { country: 'Швейцарія', emoji: '🇨🇭', type: 'Електронна віньєтка (e-vignette)', link: 'https://via.admin.ch/shop/dashboard', notes: 'Обов\'язкова для автомагістралей (лише річна)' },
  'MD': { country: 'Молдова', emoji: '🇲🇩', type: 'Електронна віньєтка (e-Vinieta)', link: 'https://evinieta.gov.md/', notes: 'Обов\'язкова для іноземних авто' },
};

export function BordersPanel() {
  const { waypoints, crossedCountries } = useTripStore();
  const borderCrossings = waypoints.filter(wp => wp.type === 'border');
  
  // Find which countries from our trip need vignettes
  const activeVignettes = crossedCountries
    .map(code => VIGNETTE_DB[code])
    .filter(Boolean);

  if (borderCrossings.length === 0 && activeVignettes.length === 0) {
    return (
      <Card className="flex-1 flex flex-col m-0 border-indigo-100 shadow-sm">
        <CardContent className="p-8 text-center text-slate-500">
          <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p>Ваш маршрут не перетинає державних кордонів з платними дорогами.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1 flex flex-col m-0 border-indigo-100 shadow-sm">
      <CardHeader className="bg-indigo-50/50 pb-4 border-b">
        <CardTitle className="text-xl flex items-center gap-2">
          <span>🛂</span> Кордони та віньєтки
        </CardTitle>
        <CardDescription>
          Інформація про пункти пропуску та платні дороги на вашому маршруті.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6 bg-white">
        
        {/* Border Crossings Section */}
        {borderCrossings.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              Пункти пропуску
            </h3>
            {borderCrossings.map(border => (
              <div key={border.id} className="rounded-xl border p-5 bg-white shadow-sm hover:border-indigo-200 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 font-bold text-slate-800 text-lg">
                      {border.name}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      Приблизне прибуття через {Math.floor(border.timeFromStart / 60)} год {border.timeFromStart % 60} хв
                    </p>
                  </div>
                  <div className="text-center bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 shrink-0">
                    <span className="text-xs text-orange-600 font-medium flex items-center gap-1 justify-center mb-0.5">
                      <Clock className="w-3 h-3" /> Очікування
                    </span>
                    <span className="text-sm font-bold text-orange-700">Невідомо</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-slate-50 rounded-lg border text-sm text-slate-600 space-y-2">
                  <p className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" /> 
                    Обов'язкова наявність "Зеленої карти" на авто.
                  </p>
                  {border.name.includes('UA') && (
                    <p className="flex gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" /> 
                      Заборонено ввозити м'ясні та молочні продукти до ЄС.
                    </p>
                  )}
                </div>

                {border.name.includes('UA') && (
                  <div className="pt-4 flex gap-2">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" onClick={() => window.open("https://dpsu.gov.ua/ua/map/", "_blank")}>
                      Онлайн камери ДПСУ <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tolls & Vignettes Section */}
        {activeVignettes.length > 0 && (
          <div className={`space-y-4 ${borderCrossings.length > 0 ? 'pt-4 border-t' : ''}`}>
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
