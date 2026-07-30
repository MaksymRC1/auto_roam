import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import routesData from '@/data/popular-routes.json';
import Link from 'next/link';

interface RouteData {
  slug: string;
  from: string;
  to: string;
  destinationCountry: string;
  distanceKm: number;
  timeHours: number;
  transitCountries: string;
  title: string;
  description: string;
}

interface Props {
  params: { slug: string };
}

// Dynamically generate static params for all 50 routes to pre-render them
export async function generateStaticParams() {
  return routesData.map((route: RouteData) => ({
    slug: route.slug,
  }));
}

// Dynamically generate SEO metadata for each route
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const route = routesData.find((r: RouteData) => r.slug === params.slug);
  
  if (!route) {
    return {
      title: 'Маршрут не знайдено',
      description: 'На жаль, цей маршрут не знайдено.',
    };
  }

  return {
    title: route.title,
    description: route.description,
    openGraph: {
      title: route.title,
      description: route.description,
      type: 'article',
      url: `https://autoroam.com.ua/marshrut/${route.slug}`,
    },
  };
}

export default function RoutePage({ params }: Props) {
  const route = routesData.find((r: RouteData) => r.slug === params.slug);

  if (!route) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Маршрут {route.from} ➔ {route.to}
        </h1>
        <p className="text-xl max-w-2xl mx-auto opacity-90">
          Сплануйте свою поїздку на авто до міста {route.to} ({route.destinationCountry}) швидко та зручно.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Швидкі факти про маршрут</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 dark:bg-gray-700 p-6 rounded-xl border border-blue-100 dark:border-gray-600">
                <div className="text-blue-500 text-sm font-semibold uppercase tracking-wider mb-1">Орієнтовна відстань</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">~ {route.distanceKm} км</div>
              </div>
              
              <div className="bg-blue-50 dark:bg-gray-700 p-6 rounded-xl border border-blue-100 dark:border-gray-600">
                <div className="text-blue-500 text-sm font-semibold uppercase tracking-wider mb-1">Час у дорозі (без кордонів)</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">~ {route.timeHours} годин</div>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">Платні дороги та транзит</h3>
              <p>
                Подорожуючи з міста <strong>{route.from}</strong> до міста <strong>{route.to}</strong> на автомобілі, 
                вам доведеться перетнути кордон та проїхати через транзитні країни. Для цього маршруту транзитними 
                країнами зазвичай є: <strong>{route.transitCountries}</strong>.
              </p>
              <p>
                Пам'ятайте, що у більшості країн Європи за користування автомагістралями стягується плата. 
                Вам потрібно буде придбати електронні віньєтки або оплачувати проїзд на пунктах збору оплати (Toll booths). 
                Штрафи за проїзд без віньєтки дуже високі, тому ми рекомендуємо купувати їх заздалегідь на офіційних державних порталах.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">Чому варто планувати з AutoRoam?</h3>
              <p>
                AutoRoam — це ваш безкоштовний персональний помічник для подорожей Європою. Ми допоможемо вам розрахувати 
                точний бюджет поїздки, вартість пального, ціни на всі необхідні віньєтки та запропонуємо оптимальні місця для зупинок.
              </p>
            </div>
            
            <div className="mt-12 text-center">
              <Link 
                href="/"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-transform hover:scale-105"
              >
                Спланувати маршрут в AutoRoam
              </Link>
              <p className="mt-4 text-sm text-gray-500">Це безкоштовно та не потребує реєстрації</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
