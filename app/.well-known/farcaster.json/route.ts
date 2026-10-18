import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const host =
    process.env.NEXT_PUBLIC_HOST ||
    req.headers.get('x-forwarded-host') ||
    req.headers.get('host') ||
    'farcaster-frame-sepia.vercel.app';
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = `${proto}://${host}`;

  const manifest = {
    accountAssociation: {
      header:
        process.env.FARCASTER_HEADER ||
        'eyJmaWQiOjMzNTM5NTEsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgxMUFlNEI1MzUwODIzN0M4OEFERkU2NUU2MDA1NWQ1OGM1YjRCNjdmIn0',
      payload:
        process.env.FARCASTER_PAYLOAD ||
        'eyJkb21haW4iOiJmYXJjYXN0ZXItZnJhbWUtc2VwaWEudmVyY2VsLmFwcCJ9',
      signature:
        process.env.FARCASTER_SIGNATURE ||
        '9FxlyoARQYV7JOMu6U/ZyGQ1VXQW4FmLQD/9+sRT+kFMRHYQH2ddWpt71E8l0atEPDVvs+gClDKIglHGz3/1zhw=',
    },
    frame: {
      version: '1',
      name: 'Base & Farcaster Airdrop',
      iconUrl: `${baseUrl}/icon.png`,
      homeUrl: baseUrl,
      imageUrl: `${baseUrl}/opengraph-image`,
      buttonTitle: 'Check & Claim Airdrop',
      splashImageUrl: `${baseUrl}/splash.png`,
      splashBackgroundColor: '#0f0e17',
    },
  };

  return NextResponse.json(manifest, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
