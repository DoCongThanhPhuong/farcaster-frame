import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const host =
    process.env.NEXT_PUBLIC_HOST ||
    req.headers.get('x-forwarded-host') ||
    req.headers.get('host') ||
    'localhost:3000';
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = `${proto}://${host}`;

  let fid = 'User';
  try {
    const body = await req.json();
    fid = body?.untrustedData?.fid ? String(body.untrustedData.fid) : 'User';
  } catch {}

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta property="og:title" content="Airdrop Status for FID #${fid}" />
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/opengraph-image" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:button:1" content="🚀 Open Mini App" />
  <meta property="fc:frame:button:1:action" content="link" />
  <meta property="fc:frame:button:1:target" content="${baseUrl}" />
</head>
<body>
  <h1>FID #${fid} Verified</h1>
  <p>Open Mini App to claim daily streak and mint Base pass.</p>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
