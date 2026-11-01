import { NextRequest, NextResponse } from 'next/server';

type SearchMode = 'image' | 'gif' | 'video';

interface PixabayImageHit {
  id: number;
  type: string;
  tags: string;
  user: string;
  pageURL: string;
  previewURL: string;
  webformatURL: string;
  largeImageURL?: string;
}

interface PixabayVideoFile {
  url: string;
  thumbnail?: string;
}

interface PixabayVideoHit {
  id: number;
  tags: string;
  user: string;
  pageURL: string;
  videos: {
    tiny?: PixabayVideoFile;
    small?: PixabayVideoFile;
    medium?: PixabayVideoFile;
  };
}

const getImageMimeType = (url: string, type: string) =>
  type === 'gif' || new URL(url).pathname.toLowerCase().endsWith('.gif')
    ? 'image/gif'
    : 'image/jpeg';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query')?.trim();
  const mode = request.nextUrl.searchParams.get('type') as SearchMode | null;
  const requestedPage = Number(request.nextUrl.searchParams.get('page') || '1');

  if (!query) return NextResponse.json({ error: 'Enter a search term.' }, { status: 400 });
  if (!mode || !['image', 'gif', 'video'].includes(mode)) {
    return NextResponse.json({ error: 'Unsupported Pixabay search type.' }, { status: 400 });
  }
  if (!Number.isInteger(requestedPage) || requestedPage < 1 || requestedPage > 1000) {
    return NextResponse.json({ error: 'Invalid results page.' }, { status: 400 });
  }

  const apiKey = process.env.PIXABAY_API_KEY || process.env.PIXABAY_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Pixabay API key is not configured.' }, { status: 503 });
  }

  try {
    const isVideo = mode === 'video';
    const url = new URL(isVideo ? 'https://pixabay.com/api/videos/' : 'https://pixabay.com/api/');
    url.searchParams.set('key', apiKey);
    url.searchParams.set('q', query.slice(0, 100));
    url.searchParams.set('per_page', '12');
    url.searchParams.set('page', String(requestedPage));
    url.searchParams.set('safesearch', 'true');

    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) {
      return NextResponse.json({ error: 'Pixabay search failed. Check the API key and try again.' }, { status: 502 });
    }

    const data = (await response.json()) as {
      hits?: PixabayImageHit[] | PixabayVideoHit[];
      totalHits?: number;
    };
    const hits = data.hits ?? [];

    if (isVideo) {
      const videos = (hits as PixabayVideoHit[]).flatMap((hit) => {
        const file = hit.videos.medium ?? hit.videos.small ?? hit.videos.tiny;
        if (!file?.url) return [];

        return [{
          id: String(hit.id),
          type: 'video' as const,
          description: hit.tags || 'Pixabay video',
          previewUrl: hit.videos.tiny?.thumbnail || hit.videos.small?.thumbnail || '',
          mediaUrl: file.url,
          mimeType: 'video/mp4',
          creator: hit.user,
          pageUrl: hit.pageURL,
        }];
      });

      return NextResponse.json({
        results: videos,
        totalPages: Math.max(1, Math.ceil((data.totalHits ?? 0) / 12)),
      });
    }

    const images = (hits as PixabayImageHit[])
      .map((hit) => {
        const mediaUrl = mode === 'gif' ? hit.webformatURL : hit.largeImageURL || hit.webformatURL;
        return {
          id: String(hit.id),
          type: hit.type === 'gif' || mode === 'gif' ? 'gif' as const : 'image' as const,
          description: hit.tags || 'Pixabay image',
          previewUrl: hit.previewURL,
          mediaUrl,
          mimeType: getImageMimeType(mediaUrl, hit.type),
          creator: hit.user,
          pageUrl: hit.pageURL,
        };
      })
      .filter((hit) => mode !== 'gif' || hit.type === 'gif');

    return NextResponse.json({
      results: images,
      totalPages: Math.max(1, Math.ceil((data.totalHits ?? 0) / 12)),
    });
  } catch {
    return NextResponse.json({ error: 'Unable to reach Pixabay.' }, { status: 502 });
  }
}