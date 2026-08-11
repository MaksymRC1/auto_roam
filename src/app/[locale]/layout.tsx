import type { Metadata, Viewport } from "next";
import { Montserrat, Geologica } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["cyrillic", "latin"],
  weight: ["700", "800"],
});

const geologica = Geologica({
  variable: "--font-geologica",
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "AutoRoam — Розумний планувальник автоподорожей",
  description: "Інструмент для планування подорожей автомобілем. Враховує кордони, паливо та готелі.",
  keywords: ["автоподорож", "маршрут", "кордон", "паливо", "калькулятор пального", "подорож Європою", "Зелена картка", "страхування авто"],
  authors: [{ name: "AutoRoam Team" }],
  openGraph: {
    type: "website",
    locale: "uk_UA",
    title: "AutoRoam — Планувальник автоподорожей",
    description: "Інструмент для планування подорожей автомобілем. Враховує кордони, паливо та готелі.",
    siteName: "AutoRoam",
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoRoam — Розумний планувальник автоподорожей",
    description: "Плануйте автомобільні подорожі Україною та Європою з AutoRoam.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${montserrat.variable} ${geologica.variable} h-full antialiased overscroll-none`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block" rel="stylesheet" />
      </head>
      <body className="min-h-[100dvh] flex flex-col font-sans bg-slate-900 text-slate-300 overflow-x-hidden w-full overscroll-none">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
        <Script id="stay22-lma" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `
          (function (s, t, a, y, twenty, two) {
            s.Stay22 = s.Stay22 || {};
            s.Stay22.params = { lmaID: '6a5ce5360d30f9c7d2a22934' };
            twenty = t.createElement(a);
            two = t.getElementsByTagName(a)[0];
            twenty.async = 1;
            twenty.src = y;
            two.parentNode.insertBefore(twenty, two);
          })(window, document, 'script', 'https://scripts.stay22.com/letmeallez.js');
        `}} />
      </body>
    </html>
  );
}
