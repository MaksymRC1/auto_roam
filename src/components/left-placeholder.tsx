"use client"
import { useState, useEffect } from "react";
import Link from "next/link";

const FEATURES = [
  { icon: "route", title: "Оптимізація маршрутів", desc: "Розумні алгоритми створюють найефективніші шляхи для вашої подорожі.", faqId: "build-route" },
  { icon: "hotel", title: "Розумні ночівлі", desc: "Автоматичний пошук оптимальних місць для відпочинку під час довгих поїздок.", faqId: "hotels" },
  { icon: "verified_user", title: "Менеджер кордонів", desc: "Час очікування та правила перетину в реальному часі.", faqId: "borders" },
  { icon: "account_balance_wallet", title: "Калькулятор витрат", desc: "Точна оцінка витрат на пальне, мита та проживання.", faqId: "fuel" },
  { icon: "add_location_alt", title: "Проміжні зупинки", desc: "Легко додавайте та сортуйте точки маршруту до вашої подорожі.", faqId: "build-route" },
  { icon: "import_export", title: "Експорт до навігаторів", desc: "Інтеграція маршруту з Google Maps та Waze в один клік.", faqId: "export" },
];

export function LeftPlaceholder() {
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStartIndex((prev) => (prev + 1) % FEATURES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const feature1 = FEATURES[startIndex];
  const feature2 = FEATURES[(startIndex + 1) % FEATURES.length];

  return (
    <>
      {/* Mobile view: 6 pulsing icons */}
      <div className="grid md:hidden grid-cols-3 gap-3 w-full py-2">
        {FEATURES.map((feature, i) => (
          <Link 
            href={`/faq#${feature.faqId}`}
            key={feature.title}
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
        <AnimatedFeatureCard feature={feature1} delay={0} />
        <AnimatedFeatureCard feature={feature2} delay={1.4} />
      </div>
    </>
  );
}

function AnimatedFeatureCard({ feature, delay }: { feature: any, delay: number }) {
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
            <h3 className="text-[20px] leading-[28px] font-bold">Placeholder Title</h3>
            <p className="text-base mt-1">Доступ до транспортних засобів вищого класу, що ідеально підходять для довгих поїздок та складних рельєфів.</p>
          </div>
        </div>

        {FEATURES.map((f) => {
          const isActive = feature.title === f.title;
          return (
            <div 
              key={f.title} 
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


