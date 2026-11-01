// app/api/media/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

  try {
    const mediaUrl = new URL(url);
    if (!['http:', 'https:'].includes(mediaUrl.protocol)) {
      return NextResponse.json({ error: 'Unsupported media URL protocol' }, { status: 400 });
    }

    const requestHeaders = new Headers({
      Accept: '*/*',
      'User-Agent': 'CutawayEditor/0.1.0 (media proxy)',
    });
    const range = req.headers.get('range');
    if (range) requestHeaders.set('Range', range);

    const upstream = await fetch(mediaUrl, { headers: requestHeaders });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Remote media server returned ${upstream.status}` },
        { status: 502 }
      );
    }

    const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream';
    const responseHeaders = new Headers({
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    });

    for (const header of ['accept-ranges', 'content-length', 'content-range']) {
      const value = upstream.headers.get(header);
      if (value) responseHeaders.set(header, value);
    }

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json({ error: 'Unable to fetch remote media' }, { status: 502 });
  }
}