const ukRegionNames = new Intl.DisplayNames(['uk'], { type: 'region' });

export function getCountryName(code: string): string {
  try {
    return ukRegionNames.of(code) || code;
  } catch {
    return code;
  }
}
