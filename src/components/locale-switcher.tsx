"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <div className="relative inline-block text-white/80 hover:text-white">
      <select
        value={locale}
        onChange={handleLocaleChange}
        className="appearance-none bg-transparent font-medium text-sm pr-6 pl-2 py-1 outline-none cursor-pointer uppercase transition-colors rounded hover:bg-white/5"
      >
        <option value="uk" className="text-slate-900 uppercase">УКР</option>
        <option value="en" className="text-slate-900 uppercase">ENG</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
}
