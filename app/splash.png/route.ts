import { NextResponse } from 'next/server';
import sharp from 'sharp';

export async function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <rect width="600" height="600" fill="#0d0e15"/>
    <circle cx="300" cy="270" r="140" fill="#855DCD" opacity="0.15"/>
    <circle cx="300" cy="270" r="110" fill="#1e1838"/>
    <text x="300" y="295" text-anchor="middle" fill="#FFFFFF" font-size="96" font-family="sans-serif">🪂</text>
    <text x="300" y="440" text-anchor="middle" fill="#FFFFFF" font-size="34" font-weight="bold" font-family="sans-serif">FARCASTER AIRDROP</text>
    <text x="300" y="480" text-anchor="middle" fill="#8B8CA3" font-size="20" font-family="sans-serif">Builder Rewards &amp; Daily Claim</text>
  </svg>`;

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

  return new NextResponse(pngBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
