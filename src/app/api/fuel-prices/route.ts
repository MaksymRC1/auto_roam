import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET() {
  try {
    // We add revalidate to cache the fetch request for 24 hours (86400 seconds)
    // Next.js fetch caching applies here if configured.
    const res = await fetch('https://www.cargopedia.net/europe-fuel-prices', {
      next: { revalidate: 86400 } 
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch from Cargopedia: ${res.statusText}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const fuelPrices: Record<string, { gasoline: number; diesel: number; lpg: number }> = {};

    $('table tbody tr').each((_, el) => {
      const img = $(el).find('td.tara img.flag');
      if (img.length === 0) return;

      const src = img.attr('src');
      if (!src) return;

      // Extract ISO code from something like "https://www.cargopedia.net/img/flags/24/UA.png"
      const match = src.match(/\/(\w{2})\.png$/i);
      if (!match) return;

      const isoCode = match[1].toUpperCase();

      const tds = $(el).find('td');
      // tds[0] is country name/img
      // tds[1] is Gasoline 95
      // tds[2] is Diesel
      // tds[3] is LPG

      const parsePrice = (text: string) => {
        const val = parseFloat(text);
        return isNaN(val) ? 0 : val;
      };

      const gasoline = parsePrice($(tds[1]).text().trim());
      const diesel = parsePrice($(tds[2]).text().trim());
      const lpg = parsePrice($(tds[3]).text().trim());

      fuelPrices[isoCode] = {
        gasoline,
        diesel,
        lpg,
      };
    });

    return NextResponse.json({
      success: true,
      lastUpdated: new Date().toISOString(),
      prices: fuelPrices
    });
  } catch (error: unknown) {
    console.error('Error scraping fuel prices:', error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
