"use client";

import { useScrollLock } from "@/hooks/use-scroll-lock";
import { useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  const t = useTranslations('Modals.Privacy');
  const locale = useLocale();
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
            {t('title')}
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
            <h2 className="text-lg font-semibold text-white">{t('section1Title')}</h2>
            <p>
              {t('section1Body1')}
            </p>
            <p>
              {t('section1Body2')}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">{t('section2Title')}</h2>
            <p>
              {t('section2Body')}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">{t('section3Title')}</h2>
            <p>
              {t('section3Body')}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">{t('section4Title')}</h2>
            <p>
              {t('section4Body')}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">{t('section5Title')}</h2>
            <p>
              {t('section5Body')}
            </p>
          </section>

          <div className="pt-4 text-xs text-white/50 pb-2">
            {t('lastUpdated')} {new Date().toLocaleDateString(locale === 'en' ? 'en-US' : 'uk-UA')}
          </div>
        </div>
      </div>
    </div>
  );
}
