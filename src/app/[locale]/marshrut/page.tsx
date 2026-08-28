import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import routesData from '@/data/popular-routes.json';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: 'RouteDirectory' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function RouteDirectoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: 'RouteDirectory' });

  // Групуємо маршрути за країною призначення для зручності
  const groupedRoutes = routesData.reduce((acc: Record<string, typeof routesData>, route) => {
    const country = route.destinationCountry;
    if (!acc[country]) acc[country] = [];
    acc[country].push(route);
    return acc;
  }, {});

  const countries = Object.keys(groupedRoutes).sort();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">{t('heroTitle')}</h1>
        <p className="text-xl max-w-2xl mx-auto opacity-90">{t('heroSubtitle')}</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {countries.map((country) => (
            <div key={country} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                📍 {country}
              </h2>
              <ul className="space-y-3">
                {groupedRoutes[country].map((route: any) => (
                  <li key={route.slug}>
                    <Link 
                      href={`/marshrut/${route.slug}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    >
                      {route.from} ➔ {route.to}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
