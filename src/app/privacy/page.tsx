import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Політика конфіденційності | AutoRoam",
  description: "Політика конфіденційності сервісу AutoRoam.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 py-20 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white mb-8">Політика конфіденційності</h1>
        
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">1. Збір та використання даних</h2>
          <p>
            Ми поважаємо вашу приватність. На даний момент AutoRoam працює переважно на стороні клієнта (у вашому браузері). 
            Ми не збираємо і не зберігаємо ваші персональні дані (наприклад, точні координати вашого поточного місцезнаходження), якщо ви самі не надасте їх для побудови маршруту.
          </p>
          <p>
            Для пошуку локацій та прокладання маршрутів введені вами дані (назви міст або координати) передаються стороннім API (Open-Meteo, OSRM, BigDataCloud, Photon). Вони використовуються виключно для виконання вашого запиту.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">2. Файли Cookie та локальне сховище</h2>
          <p>
            Ми використовуємо технології локального сховища вашого браузера (Local Storage) для збереження налаштувань (наприклад, витрати пального вашого авто, обрана валюта). Це дозволяє не вводити ці дані щоразу заново.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">3. Передача даних третім особам</h2>
          <p>
            Ми не продаємо і не передаємо вашу персональну інформацію стороннім маркетинговим або рекламним компаніям. Ваші дані можуть оброблятися лише постачальниками API для прокладання маршруту (як зазначено в п.1).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">4. Аналітика</h2>
          <p>
            На сайті може використовуватися анонімна веб-аналітика для відстеження загальної статистики відвідувань (щоб ми розуміли, які функції найпопулярніші). Ці дані не прив&#39;язуються до конкретної особи.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">5. Зв&#39;язок з нами</h2>
          <p>
            Якщо у вас виникли запитання щодо цієї політики конфіденційності, ви можете зв&#39;язатися з нами через форму зворотного зв&#39;язку або кнопки контактів у підвалі сайту.
          </p>
        </section>

        <div className="pt-8 text-sm text-white/50">
          Останнє оновлення: {new Date().toLocaleDateString('uk-UA')}
        </div>
      </div>
    </div>
  );
}
