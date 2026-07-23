import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Умови використання | AutoRoam",
  description: "Умови використання сервісу планування подорожей AutoRoam.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 py-20 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white mb-8">Умови використання</h1>
        
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">1. Загальні положення</h2>
          <p>
            Ці Умови використання регулюють доступ до та використання сервісу AutoRoam. 
            Використовуючи наш сервіс, ви погоджуєтеся з цими умовами.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">2. Відмова від відповідальності (Disclaimer)</h2>
          <p>
            Сервіс AutoRoam надається &quot;як є&quot;. Маршрути, час у дорозі, ціни на пальне, наявність віньєток та інші дані є орієнтовними і генеруються на основі відкритих джерел (OSRM, Open-Meteo тощо). 
          </p>
          <p>
            Автор не несе відповідальності за:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Реальні затори, ремонти доріг або закриті кордони;</li>
            <li>Точність розрахунку витрат на пальне;</li>
            <li>Будь-які збитки або незручності, що виникли під час поїздки за запропонованим маршрутом.</li>
          </ul>
          <p>
            Завжди звіряйтеся з офіційними джерелами та ПДР відповідних країн перед початком подорожі.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">3. Партнерські посилання (Affiliate Links)</h2>
          <p>
            Наш сервіс підтримується користувачами та є безкоштовним. Однак, на сайті можуть бути розміщені партнерські посилання (наприклад, бронювання готелів або купівля страхування). Якщо ви здійснюєте покупку через такі посилання, ми можемо отримати невелику комісію без жодних додаткових витрат для вас. Це допомагає нам підтримувати роботу серверів та розвивати проект.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">4. Зміни умов</h2>
          <p>
            Ми залишаємо за собою право змінювати ці Умови в будь-який час. Продовжуючи користуватися сервісом після внесення змін, ви погоджуєтеся з новими Умовами.
          </p>
        </section>

        <div className="pt-8 text-sm text-white/50">
          Останнє оновлення: {new Date().toLocaleDateString('uk-UA')}
        </div>
      </div>
    </div>
  );
}
