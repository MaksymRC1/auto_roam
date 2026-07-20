import type { Metadata } from "next";
import { Montserrat, Geologica } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

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
  title: "AutoRoam —  Планувальник автоподорожей",
  description: "Плануйте автомобільні подорожі Європою: маршрути, кордони, паливо, ночівля та бюджет.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${montserrat.variable} ${geologica.variable} h-full antialiased`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-slate-900 text-slate-300 overflow-x-hidden w-full">
        {children}
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
