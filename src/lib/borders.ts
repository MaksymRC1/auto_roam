export const SCHENGEN_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IS', 'IT', 
  'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'CH'
]);


interface VignetteInfo {
  country: string;
  emoji: string;
  type: string;
  link: string;
  priceEur: number; // average short-term vignette price in EUR
  notes?: string;
}

export const VIGNETTE_DB: Record<string, VignetteInfo> = {
  'PL': { country: 'Польща', emoji: '🇵🇱', type: 'Оплата на воротах / e-TOLL', link: 'https://etoll.gov.pl/ua/', priceEur: 10, notes: 'Автомагістралі A2, A4' },
  'RO': { country: 'Румунія', emoji: '🇷🇴', type: 'Електронна ровіньєтка', link: 'https://hotline.finance/ua/vinietky?utm_source=postaffiliatepro&utm_medium=cpa&utm_campaign=628r4tmflyrm0&a_aid=628r4tmflyrm0&a_bid=b789e41f', priceEur: 7, notes: "Обов'язкова на всіх національних дорогах" },
  'BG': { country: 'Болгарія', emoji: '🇧🇬', type: 'Електронна віньєтка (BG TOLL)', link: 'https://hotline.finance/ua/vinietky?utm_source=postaffiliatepro&utm_medium=cpa&utm_campaign=628r4tmflyrm0&a_aid=628r4tmflyrm0&a_bid=b789e41f', priceEur: 8, notes: "Обов'язкова на всіх національних дорогах" },
  'SK': { country: 'Словаччина', emoji: '🇸🇰', type: 'Електронна віньєтка', link: 'https://hotline.finance/ua/vinietky?utm_source=postaffiliatepro&utm_medium=cpa&utm_campaign=628r4tmflyrm0&a_aid=628r4tmflyrm0&a_bid=b789e41f', priceEur: 12, notes: "Обов'язкова для автомагістралей" },
  'CZ': { country: 'Чехія', emoji: '🇨🇿', type: 'Електронна віньєтка', link: 'https://hotline.finance/ua/vinietky?utm_source=postaffiliatepro&utm_medium=cpa&utm_campaign=628r4tmflyrm0&a_aid=628r4tmflyrm0&a_bid=b789e41f', priceEur: 12, notes: "Обов'язкова для автомагістралей" },
  'HU': { country: 'Угорщина', emoji: '🇭🇺', type: 'Електронна віньєтка (e-matrica)', link: 'https://hotline.finance/ua/vinietky?utm_source=postaffiliatepro&utm_medium=cpa&utm_campaign=628r4tmflyrm0&a_aid=628r4tmflyrm0&a_bid=b789e41f', priceEur: 15, notes: "Обов'язкова для автомагістралей" },
  'AT': { country: 'Австрія', emoji: '🇦🇹', type: 'Віньєтка (ASFINAG)', link: 'https://hotline.finance/ua/vinietky?utm_source=postaffiliatepro&utm_medium=cpa&utm_campaign=628r4tmflyrm0&a_aid=628r4tmflyrm0&a_bid=b789e41f', priceEur: 10, notes: "Обов'язкова для автомагістралей. Є цифрова версія." },
  'CH': { country: 'Швейцарія', emoji: '🇨🇭', type: 'Електронна віньєтка (e-vignette)', link: 'https://hotline.finance/ua/vinietky?utm_source=postaffiliatepro&utm_medium=cpa&utm_campaign=628r4tmflyrm0&a_aid=628r4tmflyrm0&a_bid=b789e41f', priceEur: 42, notes: "Обов'язкова для автомагістралей (лише річна)" },
  'MD': { country: 'Молдова', emoji: '🇲🇩', type: 'Електронна віньєтка (e-Vinieta)', link: 'https://hotline.finance/ua/vinietky?utm_source=postaffiliatepro&utm_medium=cpa&utm_campaign=628r4tmflyrm0&a_aid=628r4tmflyrm0&a_bid=b789e41f', priceEur: 4, notes: "Обов'язкова для іноземних авто" },
  'RS': { country: 'Сербія', emoji: '🇷🇸', type: 'Оплата за ділянки / електронний TAG', link: 'https://www.putevi-srbije.rs/index.php/en/', priceEur: 15, notes: 'Оплата на воротах або через електронний пристрій TAG' },
};

export interface DistanceTollRate {
  country: string;
  ratePerKmEur: number; // EUR per km on highways
  notes?: string;
  calculatorUrl?: string;
}

export const DISTANCE_TOLL_RATES: Record<string, DistanceTollRate> = {
  'PL': { country: 'Польща', ratePerKmEur: 0.05, notes: 'Магістралі A1, A2, A4 (е-TOLL/ворота)', calculatorUrl: 'https://etoll.gov.pl/ua/' },
  'RS': { country: 'Сербія', ratePerKmEur: 0.06, notes: 'Оплата за ділянки (ворота/TAG)', calculatorUrl: 'https://www.putevi-srbije.rs/index.php/en/' },
  'HR': { country: 'Хорватія', ratePerKmEur: 0.07, notes: 'Оплата на воротах (ENC/карткою)', calculatorUrl: 'https://www.hac.hr/en/toll-rates' },
  'IT': { country: 'Італія', ratePerKmEur: 0.08, notes: 'Автостради (Telepass/карткою)', calculatorUrl: 'https://www.autostrade.it/en/pedaggio' },
  'FR': { country: 'Франція', ratePerKmEur: 0.10, notes: 'Autoroutes (Télépéage/карткою)', calculatorUrl: 'https://www.autoroutes.fr/en/routes.htm' },
  'ES': { country: 'Іспанія', ratePerKmEur: 0.09, notes: 'Платні ділянки (AP)', calculatorUrl: 'https://www.autopistas.com/en/' },
  'PT': { country: 'Португалія', ratePerKmEur: 0.08, notes: 'Via Verde / електронна оплата', calculatorUrl: 'https://www.portugaltolls.com/en/' },
  'GR': { country: 'Греція', ratePerKmEur: 0.06, notes: 'Оплата на пунктах збору', calculatorUrl: 'https://www.aegomotorsway.gr/' },
  'MK': { country: 'Північна Македонія', ratePerKmEur: 0.04, notes: 'Оплата на пунктах збору', calculatorUrl: 'https://roads.org.mk/' },
  'TR': { country: 'Туреччина', ratePerKmEur: 0.03, notes: 'HGS / OGS', calculatorUrl: 'https://www.kgm.gov.tr/' },
};


export interface BorderPoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  fromCountry: string;
  toCountry: string;
}

export const BORDER_CROSSINGS: BorderPoint[] = [
  // UA -> PL
  { id: 'ua_pl_krakivets', name: 'Краківець - Корчова', lat: 49.9542, lon: 23.0298, fromCountry: 'UA', toCountry: 'PL' },
  { id: 'ua_pl_shehyni', name: 'Шегині - Медика', lat: 49.7978, lon: 22.9723, fromCountry: 'UA', toCountry: 'PL' },
  { id: 'ua_pl_rava', name: 'Рава-Руська - Гребенне', lat: 50.2599, lon: 23.5855, fromCountry: 'UA', toCountry: 'PL' },
  { id: 'ua_pl_yahodyn', name: 'Ягодин - Дорогуськ', lat: 51.2064, lon: 23.8052, fromCountry: 'UA', toCountry: 'PL' },
  { id: 'ua_pl_ustyluh', name: 'Устилуг - Зосін', lat: 50.8576, lon: 24.1353, fromCountry: 'UA', toCountry: 'PL' },
  { id: 'ua_pl_hrushiv', name: 'Грушів - Будомєж', lat: 50.1165, lon: 23.2842, fromCountry: 'UA', toCountry: 'PL' },
  { id: 'ua_pl_smilnytsya', name: 'Смільниця - Кросьценко', lat: 49.4673, lon: 22.7915, fromCountry: 'UA', toCountry: 'PL' },
  
  // UA -> SK
  { id: 'ua_sk_uzhhorod', name: 'Ужгород - Вишнє Нємецке', lat: 48.6606, lon: 22.2619, fromCountry: 'UA', toCountry: 'SK' },
  { id: 'ua_sk_maly_berezny', name: 'Малий Березний - Убля', lat: 48.8856, lon: 22.4285, fromCountry: 'UA', toCountry: 'SK' },

  // UA -> HU
  { id: 'ua_hu_chop', name: 'Чоп (Тиса) - Захонь', lat: 48.4230, lon: 22.1764, fromCountry: 'UA', toCountry: 'HU' },
  { id: 'ua_hu_luzhanka', name: 'Лужанка - Берегшурань', lat: 48.1633, lon: 22.5694, fromCountry: 'UA', toCountry: 'HU' },
  { id: 'ua_hu_vilok', name: 'Вилок - Тісабеч', lat: 48.1066, lon: 22.8252, fromCountry: 'UA', toCountry: 'HU' },

  // UA -> RO
  { id: 'ua_ro_porubne', name: 'Порубне - Сірет', lat: 48.0163, lon: 26.0465, fromCountry: 'UA', toCountry: 'RO' },
  { id: 'ua_ro_dyakove', name: 'Дякове - Халмеу', lat: 47.9942, lon: 22.9972, fromCountry: 'UA', toCountry: 'RO' },
  { id: 'ua_ro_solotvyno', name: 'Солотвино - Сігету-Мармацієй', lat: 47.9507, lon: 23.8647, fromCountry: 'UA', toCountry: 'RO' },
  { id: 'ua_ro_krasnoyilsk', name: 'Красноїльськ - Вікову де Сус', lat: 47.9868, lon: 25.5684, fromCountry: 'UA', toCountry: 'RO' },
  { id: 'ua_ro_orlivka', name: 'Орлівка - Ісакча (пором)', lat: 45.2818, lon: 28.4611, fromCountry: 'UA', toCountry: 'RO' },

  // UA -> MD
  { id: 'ua_md_mamalyha', name: 'Мамалига - Крива', lat: 48.2562, lon: 26.6263, fromCountry: 'UA', toCountry: 'MD' },
  { id: 'ua_md_palanka', name: 'Паланка - Маяки', lat: 46.4088, lon: 30.1332, fromCountry: 'UA', toCountry: 'MD' },
  { id: 'ua_md_starokozache', name: 'Старокозаче - Тудора', lat: 46.3683, lon: 30.0461, fromCountry: 'UA', toCountry: 'MD' },
  { id: 'ua_md_reni', name: 'Рені - Джюрджюлешть', lat: 45.4523, lon: 28.2144, fromCountry: 'UA', toCountry: 'MD' },
  { id: 'ua_md_mohyliv', name: 'Могилів-Подільський - Отач', lat: 48.4552, lon: 27.7885, fromCountry: 'UA', toCountry: 'MD' },
];

export function getBorderCrossings(fromCode: string, toCode: string): BorderPoint[] {
  // Support both directions
  const direct = BORDER_CROSSINGS.filter(b => b.fromCountry === fromCode && b.toCountry === toCode);
  if (direct.length > 0) return direct;
  
  const reverse = BORDER_CROSSINGS.filter(b => b.fromCountry === toCode && b.toCountry === fromCode);
  return reverse.map(b => {
    const nameParts = b.name.split(' - ');
    const reversedName = nameParts.length === 2 ? `${nameParts[1].trim()} - ${nameParts[0].trim()}` : b.name;
    return {
      ...b,
      name: reversedName,
      fromCountry: fromCode,
      toCountry: toCode
    };
  });
}

export function isSchengenPair(fromCode: string, toCode: string): boolean {
  return SCHENGEN_COUNTRIES.has(fromCode) && SCHENGEN_COUNTRIES.has(toCode);
}
