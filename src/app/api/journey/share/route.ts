import { NextResponse } from 'next/server';
import { saveJourney, getJourney } from '@/lib/db';

// Custom lightweight ID generator to keep dependencies minimal
function generateShortId(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { routeData, anonymousUserId, userId } = body;

    if (!routeData) {
      return NextResponse.json({ error: 'Route data is required' }, { status: 400 });
    }

    // Generate a unique ID, retry up to 5 times if collision occurs
    let shortId = generateShortId();
    let attempts = 0;
    let isUnique = false;

    while (attempts < 5) {
      const existing = await getJourney(shortId);
      if (!existing) {
        isUnique = true;
        break;
      }
      shortId = generateShortId();
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json({ error: 'Could not generate a unique short link, please try again.' }, { status: 500 });
    }

    await saveJourney({
      id: shortId,
      route_data: routeData,
      anonymous_user_id: anonymousUserId || null,
      user_id: userId || null,
    });

    return NextResponse.json({ id: shortId });
  } catch (error) {
    console.error('Error sharing journey:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
