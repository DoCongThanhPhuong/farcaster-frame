import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const host =
    process.env.NEXT_PUBLIC_HOST ||
    req.headers.get('x-forwarded-host') ||
    req.headers.get('host') ||
    'localhost:3000';
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = `${proto}://${host}`;

  const manifest = {
    accountAssociation: {
      header:
        process.env.FARCASTER_HEADER ||
        'eyJmaWQiOjEsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhiYzczMmE3OGMwZDRkNTM3OTkyOTJiNDQ5YzE1NzQzNWJjMzY5NWFmNWVhYzU3Mzc5OGE2OTBlMWVhYzg5NjQ5In0',
      payload:
        process.env.FARCASTER_PAYLOAD ||
        'eyJkb21haW4iOiJmYXJjYXN0ZXItZnJhbWUudmVyY2VsLmFwcCJ9',
      signature:
        process.env.FARCASTER_SIGNATURE ||
        'MHgwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAw',
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
      webhookUrl: `${baseUrl}/api/webhook`,
    },
  };

  return NextResponse.json(manifest, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
