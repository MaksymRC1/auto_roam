import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const latlng = searchParams.get('latlng');
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is missing' }, { status: 500 });
  }

  try {
    let url = `https://maps.googleapis.com/maps/api/geocode/json?key=${apiKey}&language=uk`;
    if (address) {
      url += `&address=${encodeURIComponent(address)}`;
    } else if (latlng) {
      url += `&latlng=${encodeURIComponent(latlng)}`;
    } else {
      return NextResponse.json({ error: 'Missing address or latlng parameter' }, { status: 400 });
    }

    const response = await fetch(url);
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Geocoding API error:', error);
    return NextResponse.json({ error: 'Failed to fetch geocoding data' }, { status: 500 });
  }
}
