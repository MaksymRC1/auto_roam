import { MetadataRoute } from 'next';
import articlesData from '@/data/articles.json';

export default function sitemap(): MetadataRoute.Sitemap {
  const articles: MetadataRoute.Sitemap = articlesData.map((article) => ({
    url: `https://autoroam.com.ua/articles/${article.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [
    {
      url: 'https://autoroam.com.ua',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://autoroam.com.ua/journey',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://autoroam.com.ua/articles',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://autoroam.com.ua/faq',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...articles,
  ];
}
