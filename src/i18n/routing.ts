import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['uk', 'en'],
  defaultLocale: 'uk',
  localePrefix: 'as-needed' // uk will be / and en will be /en
});

// Lightweight wrappers around Next.js' navigation APIs
export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing);
