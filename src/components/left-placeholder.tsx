"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function LeftPlaceholder() {
  const t = useTranslations('Placeholder');
  const FEATURES = [
    { icon: "route", title: t('routeOptimizationTitle'), desc: t('routeOptimizationDesc'), faqId: "build-route" },
    { icon: "hotel", title: t('smartStopsTitle'), desc: t('smartStopsDesc'), faqId: "hotels" },
    { icon: "verified_user", title: t('borderManagerTitle'), desc: t('borderManagerDesc'), faqId: "borders" },
    { icon: "account_balance_wallet", title: t('costCalculatorTitle'), desc: t('costCalculatorDesc'), faqId: "fuel" },
    { icon: "confirmation_number", title: t('intermediateStopsTitle'), desc: t('intermediateStopsDesc'), faqId: "vignettes" },
    { icon: "wifi_off", title: t('exportNavTitle'), desc: t('exportNavDesc'), faqId: "offline" },
  ];
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStartIndex((prev) => (prev + 1) % FEATURES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [FEATURES.length]);

  const feature1 = FEATURES[startIndex];
  const feature2 = FEATURES[(startIndex + 1) % FEATURES.length];

  return (
    <>
      {/* Mobile view: 6 pulsing icons */}
      <div className="grid md:hidden grid-cols-3 gap-3 w-full py-2">
        {FEATURES.map((feature, i) => (
          <Link 
            href={`/faq#${feature.faqId}`}
            key={i}
            className="animate-pulse-scale w-full aspect-square rounded-[16px] bg-black/45 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg hover:bg-white/10 transition-colors"
            style={{ animationDelay: `${i * 0.15}s` }}
            title={feature.title}
          >
            <span className="material-symbols-outlined text-white text-[32px]">{feature.icon}</span>
          </Link>
        ))}
      </div>

      {/* Tablet/Desktop view: 2 rotating cards */}
      <div className="hidden md:flex w-full h-full flex-col gap-4">
        <AnimatedFeatureCard feature={feature1} delay={0} features={FEATURES} />
        <AnimatedFeatureCard feature={feature2} delay={1.4} features={FEATURES} />
      </div>
    </>
  );
}

function AnimatedFeatureCard({ feature, delay, features }: { feature: any, delay: number, features: any[] }) {
  const t = useTranslations('Placeholder');
  return (
    <Link 
      href={`/faq#${feature.faqId}`}
      className="flex-1 flex flex-col justify-center animate-pulse-scale bg-black/45 backdrop-blur-md border border-white/10 rounded-[20px] p-6 w-full hover:bg-white/5 transition-colors cursor-pointer group" 
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="relative w-full h-full">
        {/* Невидимий блок для підтримки висоти контейнера на мобільних */}
        <div className="w-full invisible flex items-start gap-4 pointer-events-none">
          <div className="w-12 h-12 shrink-0" />
          <div className="flex-1">
            <h3 className="text-[20px] leading-[28px] font-bold">{t('routeOptimizationTitle')}</h3>
            <p className="text-base mt-1">{t('premiumCarDesc')}</p>
          </div>
        </div>

        {features.map((f, i) => {
          const isActive = feature.title === f.title;
          return (
            <div 
              key={i} 
              className={`absolute inset-0 flex items-center gap-4 w-full transition-all duration-[2000ms] ease-in-out ${
                isActive ? "opacity-100 translate-y-0 z-10" : "opacity-0 translate-y-2 z-0 pointer-events-none"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20 group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-white text-[24px]">{f.icon}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-[20px] leading-[28px] font-bold text-white">{f.title}</h3>
                <p className="text-base text-slate-300 mt-1">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Link>
  );
}


