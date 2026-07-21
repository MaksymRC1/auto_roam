// Named constants to replace magic numbers across the codebase
export const FUEL_BUFFER_RATIO = 1.1;          // 10% fuel reserve
export const LONG_TRIP_THRESHOLD_MINS = 480;    // 8 hours threshold for hotel suggestion
export const DEFAULT_FUEL_CONSUMPTION = 8;      // liters per 100km
export const BORDER_SAMPLE_COUNT = 10;           // number of samples for border detection
export const EMERGENCY_RESERVE_RATIO = 0.15;    // 15% emergency budget reserve

export const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  UAH: '₴',
  PLN: 'zł',
};

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}
