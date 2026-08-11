"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (nextLocale: string) => {
    if (nextLocale === locale) return;
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <div className="flex items-center bg-white/10 rounded-full p-1 border border-white/10">
      <button 
        onClick={() => handleLocaleChange('uk')}
        className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 focus:outline-none ${locale === 'uk' ? 'bg-white text-slate-900 shadow-md scale-100' : 'text-white/60 hover:text-white scale-95 hover:scale-100'}`}
        aria-label="Switch to Ukrainian"
      >
        UK
      </button>
      <button 
        onClick={() => handleLocaleChange('en')}
        className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 focus:outline-none ${locale === 'en' ? 'bg-white text-slate-900 shadow-md scale-100' : 'text-white/60 hover:text-white scale-95 hover:scale-100'}`}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
}
