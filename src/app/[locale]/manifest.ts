import type { MetadataRoute } from 'next';
import { getTranslations } from 'next-intl/server';

export default async function manifest({
  params
}: {
  params: { locale: string }
}): Promise<MetadataRoute.Manifest> {
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'Manifest'
  });

  return {
    name: 'AutoRoam',
    short_name: 'AutoRoam',
    description: t('description'),
    start_url: `/${params.locale}`,
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
