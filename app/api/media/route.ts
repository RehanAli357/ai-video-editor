// app/api/media/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

  try {
    const upstream = await fetch(url);
    if (!upstream.ok) throw new Error(`Upstream ${upstream.status}`);

    const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream';
    return new NextResponse(upstream.body, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 502 });
  }
}