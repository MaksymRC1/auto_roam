import { MetadataRoute } from 'next';
import articlesData from '@/data/articles.json';
import routesData from '@/data/popular-routes.json';

export default function sitemap(): MetadataRoute.Sitemap {
  const articles: MetadataRoute.Sitemap = articlesData.map((article) => ({
    url: `https://autoroam.com.ua/articles/${article.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
    alternates: {
      languages: {
        uk: `https://autoroam.com.ua/articles/${article.id}`,
        en: `https://autoroam.com.ua/en/articles/${article.id}`,
      },
    },
  }));

  const routes: MetadataRoute.Sitemap = routesData.map((route) => ({
    url: `https://autoroam.com.ua/marshrut/${route.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
    alternates: {
      languages: {
        uk: `https://autoroam.com.ua/marshrut/${route.slug}`,
        en: `https://autoroam.com.ua/en/marshrut/${route.slug}`,
      },
    },
  }));

  return [
    {
      url: 'https://autoroam.com.ua',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: { languages: { uk: 'https://autoroam.com.ua', en: 'https://autoroam.com.ua/en' } },
    },
    {
      url: 'https://autoroam.com.ua/marshrut',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: { languages: { uk: 'https://autoroam.com.ua/marshrut', en: 'https://autoroam.com.ua/en/marshrut' } },
    },
    {
      url: 'https://autoroam.com.ua/journey',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages: { uk: 'https://autoroam.com.ua/journey', en: 'https://autoroam.com.ua/en/journey' } },
    },
    {
      url: 'https://autoroam.com.ua/articles',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: { languages: { uk: 'https://autoroam.com.ua/articles', en: 'https://autoroam.com.ua/en/articles' } },
    },
    {
      url: 'https://autoroam.com.ua/faq',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: { languages: { uk: 'https://autoroam.com.ua/faq', en: 'https://autoroam.com.ua/en/faq' } },
    },
    ...articles,
    ...routes,
  ];
}
