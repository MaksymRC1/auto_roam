"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { BackgroundSlideshow } from "@/components/background-slideshow";
import { FaqAccordion } from "@/components/faq-accordion";
import { Footer } from "@/components/footer";
import { SupportModal } from "@/components/support-modal";

const faqItems = [
  {
    id: "build-route",
    question: "Як побудувати оптимальний маршрут?",
    answer: "Введіть початкову та кінцеву точки у головному віджеті на домашній сторінці. Ви можете додати до 8 проміжних зупинок (для безкоштовної версії). Натисніть 'Побудувати маршрут', і система прокладе найшвидший шлях, враховуючи дорожні умови."
  },
  {
    id: "borders",
    question: "Як працює перетин кордонів?",
    answer: "Система автоматично визначає, чи перетинає ваш маршрут державні кордони. Якщо ви виїжджаєте за межі Шенгенської зони (або навпаки), ми автоматично додаємо відповідні прикордонні пункти."
  },
  {
    id: "fuel",
    question: "Як працює розрахунок пального?",
    answer: "Калькулятор бере до уваги загальну відстань маршруту та середню витрату пального вашого авто. Ми використовуємо актуальні ціни на пальне в тих країнах, через які ви проїжджаєте. За замовчуванням встановлена витрата 8 літрів на 100 км, але ви можете змінити її в налаштуваннях поїздки."
  },
  {
    id: "hotels",
    question: "Як працює автоматичний пошук готелів?",
    answer: "Якщо ваша подорож вимагає більше 8 годин безперервного перебування за кермом, система запропонує оптимальні місця для ночівлі. Ми знаходимо зупинки вздовж маршруту, розбиваючи дорогу на безпечні відрізки, щоб ви могли відпочити."
  },
  {
    id: "export",
    question: "Як інтегрувати маршрут у Waze або Google Maps?",
    answer: "В інформаційних блоках кожної точки на хронології маршруту є відповідні кнопки 'Waze' та 'Maps'. Зверніть увагу, що навігатори на кшталт Waze можуть мати складнощі з багатоточковими маршрутами, тому для складних подорожей з великою кількістю проміжних зупинок ми рекомендуємо експортувати відрізки окремо, або використовувати Google Maps."
  },
  {
    id: "limitations",
    question: "Які основні обмеження сервісу?",
    answer: "1. Маршрути розраховуються лише для легкових автомобілів. 2. Інформація про ціни на пальне оновлюється раз на добу, тому можливі незначні відхилення. 3. Максимальна кількість точок в одному маршруті - 10 (включно зі стартом і фінішем). 4. Проїзд платними дорогами та віньєтками в розрахунках наразі є орієнтовним."
  }
];

export default function FAQPage() {
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  return (
    <main className="min-h-screen flex flex-col font-sans overflow-x-hidden text-slate-200">
      <Navbar />
      <BackgroundSlideshow />

      <div className="flex-grow flex flex-col pt-24 md:pt-[100px] pb-12 px-4 md:px-8 w-full max-w-[800px] mx-auto z-10 gap-8">
        
        <div className="text-center mb-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-xl mb-4">
            Часті запитання
          </h1>
          <p className="text-white/70 text-lg md:text-xl">
            Інструкції, відповіді та поради щодо використання сервісу
          </p>
        </div>

        <FaqAccordion items={faqItems} />

        <div className="mt-8 w-full flex justify-center">
          <button 
            onClick={() => setIsSupportOpen(true)}
            className="bg-white text-slate-900 font-bold text-base py-3 px-8 rounded-xl shadow-lg hover:bg-slate-100 transition-colors"
          >
            Задати питання підтримці
          </button>
        </div>

      </div>

      <Footer />

      {/* Support Modal */}
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
    </main>
  );
}
