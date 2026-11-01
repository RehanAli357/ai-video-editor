import { NextRequest, NextResponse } from 'next/server';

interface UnsplashPhoto {
  id: string;
  alt_description: string | null;
  urls: { small: string; regular: string };
  user: { name: string; links: { html: string } };
  links: { html: string };
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query')?.trim();
  if (!query) return NextResponse.json({ error: 'Enter a search term.' }, { status: 400 });

  const requestedPage = Number(request.nextUrl.searchParams.get('page') || '1');
  if (!Number.isInteger(requestedPage) || requestedPage < 1 || requestedPage > 1000) {
    return NextResponse.json({ error: 'Invalid results page.' }, { status: 400 });
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY || process.env.ACCESS_KEY;
  if (!accessKey) {
    return NextResponse.json({ error: 'Unsplash access key is not configured.' }, { status: 503 });
  }

  try {
    const url = new URL('https://api.unsplash.com/search/photos');
    url.searchParams.set('query', query.slice(0, 100));
    url.searchParams.set('per_page', '12');
    url.searchParams.set('page', String(requestedPage));

    const response = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}` },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Unsplash image search failed.' }, { status: 502 });
    }

    const data = (await response.json()) as { results?: UnsplashPhoto[]; total_pages?: number };
    const photos = (data.results ?? []).map((photo) => ({
      id: photo.id,
      description: photo.alt_description || 'Unsplash photo',
      smallUrl: photo.urls.small,
      imageUrl: photo.urls.regular,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      photoUrl: photo.links.html,
    }));

    return NextResponse.json({ photos, totalPages: Math.max(1, data.total_pages ?? 1) });
  } catch {
    return NextResponse.json({ error: 'Unable to reach Unsplash.' }, { status: 502 });
  }
}