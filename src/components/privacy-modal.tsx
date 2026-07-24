"use client";

import { useScrollLock } from "@/hooks/use-scroll-lock";
import { useEffect, useRef } from "react";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in transition-all"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div 
        className="w-full max-w-2xl max-h-[85vh] rounded-[20px] shadow-2xl relative flex flex-col animate-fade-in-up"
        style={{
          background: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          fontFamily: "var(--font-geologica), sans-serif"
        }}
      >
        {/* Header (sticky) */}
        <div className="flex justify-between items-center p-5 border-b border-white/10 shrink-0">
          <h1 className="text-xl text-white font-bold" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
            Політика конфіденційності
          </h1>
          <button 
            onClick={onClose}
            aria-label="Close" 
            className="text-white/60 hover:text-white transition-colors w-8 h-8 flex items-center justify-center shrink-0 rounded-full hover:bg-white/10 focus:outline-none -mr-1"
          >
            <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: '"FILL" 0' }}>close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div 
          ref={contentRef}
          className="p-5 overflow-y-auto text-slate-300 space-y-6 text-sm flex-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
        >
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">1. Збір та використання даних</h2>
            <p>
              Ми поважаємо вашу приватність. На даний момент AutoRoam працює переважно на стороні клієнта (у вашому браузері). 
              Ми не збираємо і не зберігаємо ваші персональні дані (наприклад, точні координати вашого поточного місцезнаходження), якщо ви самі не надасте їх для побудови маршруту.
            </p>
            <p>
              Для пошуку локацій та прокладання маршрутів введені вами дані (назви міст або координати) передаються стороннім API (Open-Meteo, OSRM, BigDataCloud, Photon). Вони використовуються виключно для виконання вашого запиту.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">2. Файли Cookie та локальне сховище</h2>
            <p>
              Ми використовуємо технології локального сховища вашого браузера (Local Storage) для збереження налаштувань (наприклад, витрати пального вашого авто, обрана валюта). Це дозволяє не вводити ці дані щоразу заново.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">3. Передача даних третім особам</h2>
            <p>
              Ми не продаємо і не передаємо вашу персональну інформацію стороннім маркетинговим або рекламним компаніям. Ваші дані можуть оброблятися лише постачальниками API для прокладання маршруту (як зазначено в п.1).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">4. Аналітика</h2>
            <p>
              На сайті може використовуватися анонімна веб-аналітика для відстеження загальної статистики відвідувань (щоб ми розуміли, які функції найпопулярніші). Ці дані не прив&#39;язуються до конкретної особи.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">5. Зв&#39;язок з нами</h2>
            <p>
              Якщо у вас виникли запитання щодо цієї політики конфіденційності, ви можете зв&#39;язатися з нами через кнопки контактів у підвалі сайту.
            </p>
          </section>

          <div className="pt-4 text-xs text-white/50 pb-2">
            Останнє оновлення: {new Date().toLocaleDateString('uk-UA')}
          </div>
        </div>
      </div>
    </div>
  );
}
