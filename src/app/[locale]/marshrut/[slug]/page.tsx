import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import routesData from '@/data/popular-routes.json';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';

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
  params: Promise<{ slug: string; locale: string }>;
}

// Dynamically generate static params for all 50 routes to pre-render them
export async function generateStaticParams() {
  return routesData.map((route: RouteData) => ({
    slug: route.slug,
  }));
}

// Dynamically generate SEO metadata for each route
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const route = routesData.find((r: RouteData) => r.slug === params.slug);
  const t = await getTranslations({ locale: params.locale, namespace: 'RoutePage' });
  
  if (!route) {
    return {
      title: t('routeNotFound'),
      description: t('routeNotFoundDescription'),
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

export default async function RoutePage(props: Props) {
  const params = await props.params;
  const route = routesData.find((r: RouteData) => r.slug === params.slug);
  const t = await getTranslations('RoutePage');

  if (!route) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": route.title,
            "description": route.description,
            "author": {
              "@type": "Organization",
              "name": "AutoRoam"
            }
          })
        }}
      />
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">
          {t('routeTitle', { from: route.from, to: route.to })}
        </h1>
        <p className="text-xl max-w-2xl mx-auto opacity-90">
          {t('routeSubtitle', { to: route.to, country: route.destinationCountry })}
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('quickFacts')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 dark:bg-gray-700 p-6 rounded-xl border border-blue-100 dark:border-gray-600">
                <div className="text-blue-500 text-sm font-semibold uppercase tracking-wider mb-1">{t('estimatedDistance')}</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">~ {route.distanceKm} {t('km')}</div>
              </div>
              
              <div className="bg-blue-50 dark:bg-gray-700 p-6 rounded-xl border border-blue-100 dark:border-gray-600">
                <div className="text-blue-500 text-sm font-semibold uppercase tracking-wider mb-1">{t('travelTimeNoBorders')}</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">~ {route.timeHours} {t('hours')}</div>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">{t('tollRoadsAndTransit')}</h3>
              <p>
                {t('tollDescription1', { from: route.from, to: route.to, transit: route.transitCountries })}
              </p>
              <p>
                {t('tollDescription2')}
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">{t('whyAutoRoam')}</h3>
              <p>
                {t('whyAutoRoamDescription')}
              </p>
            </div>
            
            <div className="mt-12 text-center">
              <Link 
                href="/"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-transform hover:scale-105"
              >
                {t('planRoute')}
              </Link>
              <p className="mt-4 text-sm text-gray-500">{t('freeNoRegistration')}</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
