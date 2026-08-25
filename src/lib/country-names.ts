export function getCountryName(code: string, locale: string = 'uk'): string {
  try {
    const regionNames = new Intl.DisplayNames([locale], { type: 'region' });
    return regionNames.of(code) || code;
  } catch {
    return code;
  }
}
