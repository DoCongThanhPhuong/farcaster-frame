import { NextResponse } from 'next/server';
import { resolveBaseUrl } from '@/lib/url';

export async function POST(req: Request) {
  const baseUrl = resolveBaseUrl(req.headers);

  let fid = 'User';
  try {
    const body = await req.json();
    const rawFid = body?.untrustedData?.fid;
    if (rawFid !== undefined && rawFid !== null && Number.isInteger(Number(rawFid)) && Number(rawFid) > 0) {
      fid = String(Number(rawFid));
    }
  } catch {}

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta property="og:title" content="FarBase Rush • FID #${fid}" />
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/opengraph-image" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:button:1" content="Play FarBase Rush" />
  <meta property="fc:frame:button:1:action" content="link" />
  <meta property="fc:frame:button:1:target" content="${baseUrl}" />
</head>
<body>
  <h1>FID #${fid} Ready</h1>
  <p>Launch FarBase Rush to play today's trap course and climb the leaderboard.</p>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
