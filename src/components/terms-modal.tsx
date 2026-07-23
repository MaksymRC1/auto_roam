"use client";

import { useEffect, useRef } from "react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = "unset";
        document.documentElement.style.overflow = "unset";
      };
    }
  }, [isOpen]);

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
            Умови використання
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
            <h2 className="text-lg font-semibold text-white">1. Загальні положення</h2>
            <p>
              Ці Умови використання регулюють доступ до та використання сервісу AutoRoam. 
              Використовуючи наш сервіс, ви погоджуєтеся з цими умовами.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">2. Відмова від відповідальності (Disclaimer)</h2>
            <p>
              Сервіс AutoRoam надається &quot;як є&quot;. Маршрути, час у дорозі, ціни на пальне, наявність віньєток та інші дані є орієнтовними і генеруються на основі відкритих джерел (OSRM, Open-Meteo тощо). 
            </p>
            <p>Автор не несе відповідальності за:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Реальні затори, ремонти доріг або закриті кордони;</li>
              <li>Точність розрахунку витрат на пальне;</li>
              <li>Будь-які збитки або незручності, що виникли під час поїздки за запропонованим маршрутом.</li>
            </ul>
            <p>Завжди звіряйтеся з офіційними джерелами та ПДР відповідних країн перед початком подорожі.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">3. Партнерські посилання (Affiliate Links)</h2>
            <p>
              Наш сервіс підтримується користувачами та є безкоштовним. Однак, на сайті можуть бути розміщені партнерські посилання (наприклад, бронювання готелів або купівля страхування). Якщо ви здійснюєте покупку через такі посилання, ми можемо отримати невелику комісію без жодних додаткових витрат для вас. Це допомагає нам підтримувати роботу серверів та розвивати проект.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">4. Зміни умов</h2>
            <p>
              Ми залишаємо за собою право змінювати ці Умови в будь-який час. Продовжуючи користуватися сервісом після внесення змін, ви погоджуєтеся з новими Умовами.
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
