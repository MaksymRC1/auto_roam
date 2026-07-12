import type { Metadata } from "next";
import { Montserrat, Geologica } from "next/font/google";
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
  title: "AutoRoam — Планувальник автоподорожей",
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
      <body className="min-h-full flex flex-col font-sans bg-slate-900 text-slate-300">{children}</body>
    </html>
  );
}
