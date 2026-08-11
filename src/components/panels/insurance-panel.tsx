"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTripStore } from "@/store/useTripStore";
import { ExternalLink, Route, ShieldCheck, Plane, Car, HeartPulse, X } from "lucide-react";
import { VIGNETTE_DB } from "@/lib/borders";
import { CURRENCY_SYMBOLS } from "@/lib/constants";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslations, useLocale } from "next-intl";

export function InsurancePanel() {
  const { crossedCountries, currency, exchangeRates } = useTripStore();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const t = useTranslations('Insurance');
  const locale = useLocale();
  
  // Find which countries from our trip need vignettes
  const activeVignettes = crossedCountries
    .map(code => VIGNETTE_DB[code])
    .filter(Boolean);

  const insuranceDocs = locale === 'uk' ? [
    {
      id: "green-card",
      title: "Зелена картка (Міжнародне автострахування)",
      icon: <ShieldCheck className="w-8 h-8" />,
      desc: "Обов'язковий сертифікат для виїзду за кордон на авто, що покриває збитки третім особам у разі ДТП. Без нього перетин кордону неможливий. Ви можете швидко оформити поліс онлайн перед поїздкою.",
      link: "https://hotline.finance/ua/green-card?utm_source=postaffiliatepro&utm_medium=cpa&utm_campaign=628r4tmflyrm0&a_aid=628r4tmflyrm0&a_bid=e55516d5",
      linkText: "Оформити поліс онлайн"
    },
    {
      id: "travel",
      title: "Туристичне страхування (Медичне)",
      icon: <Plane className="w-8 h-8" />,
      desc: "Медичний захист за кордоном, який покриває витрати на лікування та невідкладну допомогу. Наполегливо рекомендується всім пасажирам.",
      link: "https://hotline.finance/ua/insurance-travel?utm_source=postaffiliatepro&utm_medium=cpa&utm_campaign=628r4tmflyrm0&a_aid=628r4tmflyrm0",
      linkText: "Зробити туристичну страховку"
    },
    {
      id: "osago",
      title: "Автоцивілка (ОСЦПВ)",
      icon: <Car className="w-8 h-8" />,
      desc: "Обов'язкове страхування відповідальності на території України. Якщо ви плануєте пересуватися Україною, переконайтеся, що ваш поліс дійсний, або ж оновіть його онлайн.",
      link: "https://hotline.finance/ua/osago?utm_source=postaffiliatepro&utm_medium=cpa&utm_campaign=628r4tmflyrm0&a_aid=628r4tmflyrm0&a_bid=562129",
      linkText: "Оновити онлайн"
    },
    {
      id: "accident",
      title: "Страхування від нещасних випадків",
      icon: <HeartPulse className="w-8 h-8" />,
      desc: "Забезпечує додатковий захист у разі непередбачуваних ситуацій під час активного відпочинку.",
      link: "https://hotline.finance/ua/accidents?utm_source=postaffiliatepro&utm_medium=cpa&utm_campaign=628r4tmflyrm0&a_aid=628r4tmflyrm0",
      linkText: "Оформити страхування"
    }
  ] : [];

  return (
    <div className="flex-1 flex flex-col space-y-4">
      <div className="pt-2 space-y-6">
        
        {/* Insurance Section */}
        {insuranceDocs.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col">
              <h3 className="font-semibold text-white/90 flex items-center gap-2">
                {t('necessaryDocs')}
              </h3>
              <p className="text-sm text-white/50 mt-1">
                {t('clickForDetails')}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              {insuranceDocs.map((doc) => (
                <button 
                  key={doc.id} 
                  onClick={() => setSelectedItem({ isVignette: false, ...doc })} 
                  className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all text-white/80 hover:text-white hover:scale-105 active:scale-95"
                  title={doc.title}
                >
                  {doc.icon}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tolls & Vignettes Section */}
        {activeVignettes.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="font-semibold text-white/90 flex items-center gap-2">
              {t('tollsAndVignettes')}
            </h3>
            
            <div className="flex flex-wrap gap-4">
              {activeVignettes.map((v, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setSelectedItem({ isVignette: true, ...v })} 
                  className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all text-3xl hover:scale-105 active:scale-95 leading-none"
                  title={v.country}
                >
                  {v.emoji}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="border-white/10 text-white sm:max-w-md w-[90vw] rounded-2xl p-6" showCloseButton={false} style={{ background: "rgba(0, 0, 0, 0.65)", backdropFilter: "blur(24px)" }}>
          <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/10 space-y-0">
            <DialogTitle className="text-xl m-0 text-white flex items-center gap-3">
              {selectedItem?.isVignette ? (
                <>
                  <span className="text-2xl">{selectedItem.emoji}</span>
                  {selectedItem.country}
                </>
              ) : (
                <span className="text-lg leading-tight pr-4">{selectedItem?.title}</span>
              )}
            </DialogTitle>
            <button onClick={() => setSelectedItem(null)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          </DialogHeader>
          
          {selectedItem?.isVignette ? (
            <div className="space-y-4 py-2 mt-2">
              <p className="text-white/80 flex items-center gap-2">
                <Route className="w-4 h-4 text-white/50" />
                {selectedItem.notes || t('nationalRoads')}
              </p>
              
              <div className="flex flex-col gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                 <div className="flex justify-between items-center">
                   <span className="text-white/60 text-sm">{t('tollType')}</span>
                   <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {selectedItem.type}
                   </span>
                 </div>
                 {selectedItem.priceEur > 0 && (
                   <div className="flex justify-between items-center">
                     <span className="text-white/60 text-sm">{t('estimatedCost')}</span>
                     <span className="font-bold text-white/90">
                       ~{Math.round(selectedItem.priceEur * (exchangeRates[currency] || 1))} {CURRENCY_SYMBOLS[currency] || currency}
                     </span>
                   </div>
                 )}
              </div>
              <button className="w-full bg-white text-slate-900 hover:bg-slate-100 rounded-full py-3.5 font-bold text-[15px] shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center outline-none mt-4" onClick={() => window.open(selectedItem.link, "_blank")}>
                {t('buyOfficially')} <ExternalLink className="w-4 h-4 ml-2 text-slate-700" />
              </button>
            </div>
          ) : (
            <div className="space-y-6 py-2 mt-2">
              <div className="flex justify-center py-4 text-white/30">
                {selectedItem?.icon && <div className="scale-[2]">{selectedItem.icon}</div>}
              </div>
              <p className="text-white/80 leading-relaxed text-[15px]">{selectedItem?.desc}</p>
              <button className="w-full bg-white text-slate-900 hover:bg-slate-100 rounded-full py-4 font-bold text-base shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center outline-none mt-2" onClick={() => window.open(selectedItem?.link, "_blank")}>
                {selectedItem?.linkText} <ExternalLink className="w-4 h-4 ml-2 text-slate-700" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
