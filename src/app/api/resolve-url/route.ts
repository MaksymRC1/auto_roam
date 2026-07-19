import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const urlObj = new URL(url);
    const validDomains = ['google.com', 'maps.google.com', 'goo.gl', 'maps.app.goo.gl'];
    if (!validDomains.some(domain => urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain))) {
      return NextResponse.json({ error: 'Invalid URL domain' }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
  }

  try {
    // Follow redirect to get the full maps URL which contains coordinates
    const res = await fetch(url, { redirect: 'manual' });
    let finalUrl = url;
    
    // Handle redirect
    if (res.status >= 300 && res.status < 400) {
      finalUrl = res.headers.get('location') || url;
      
      // If it redirects to another shortlink or intermediate page, try one more time
      if (finalUrl.includes('maps.app.goo.gl')) {
         const res2 = await fetch(finalUrl, { redirect: 'manual' });
         if (res2.status >= 300 && res2.status < 400) {
            finalUrl = res2.headers.get('location') || finalUrl;
         }
      }
    }
    
    return NextResponse.json({ success: true, url: finalUrl });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
