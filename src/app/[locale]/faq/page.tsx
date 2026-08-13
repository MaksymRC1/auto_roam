"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { BackgroundSlideshow } from "@/components/background-slideshow";
import { FaqAccordion } from "@/components/faq-accordion";
import { Footer } from "@/components/footer";
import { SupportModal } from "@/components/support-modal";
import { useTranslations } from "next-intl";

export default function FAQPage() {
  const t = useTranslations('FAQ');
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const faqItems = [
    {
      id: "build-route",
      question: t('items.build-route.question'),
      answer: t('items.build-route.answer')
    },
    {
      id: "borders",
      question: t('items.borders.question'),
      answer: t('items.borders.answer')
    },
    {
      id: "fuel",
      question: t('items.fuel.question'),
      answer: t('items.fuel.answer')
    },
    {
      id: "hotels",
      question: t('items.hotels.question'),
      answer: t('items.hotels.answer')
    },
    {
      id: "export",
      question: t('items.export.question'),
      answer: t('items.export.answer')
    },
    {
      id: "limitations",
      question: t('items.limitations.question'),
      answer: t('items.limitations.answer')
    }
  ];

  return (
    <main className="min-h-screen flex flex-col font-sans overflow-x-hidden text-slate-200">
      <Navbar />
      <BackgroundSlideshow />

      <div className="flex-grow flex flex-col pt-24 md:pt-[100px] pb-12 px-4 md:px-8 w-full max-w-[800px] mx-auto z-10 gap-8">
        
        <div className="text-center mb-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-xl mb-4">
            {t('title')}
          </h1>
          <p className="text-white/70 text-lg md:text-xl">
            {t('subtitle')}
          </p>
        </div>

        <FaqAccordion items={faqItems} />

        <div className="mt-8 w-full flex justify-center">
          <button 
            onClick={() => setIsSupportOpen(true)}
            className="bg-white text-slate-900 font-bold text-base py-3 px-8 rounded-xl shadow-lg hover:bg-slate-100 transition-colors"
          >
            {t('supportBtn')}
          </button>
        </div>

      </div>

      <Footer />

      {/* Support Modal */}
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
    </main>
  );
}
