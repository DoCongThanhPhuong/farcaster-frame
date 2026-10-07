import { NextResponse } from 'next/server';
import sharp from 'sharp';

export async function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <rect width="256" height="256" rx="64" fill="#855DCD"/>
    <circle cx="128" cy="128" r="90" fill="#1b1238"/>
    <text x="128" y="145" text-anchor="middle" fill="#FFFFFF" font-size="90" font-weight="bold" font-family="sans-serif">🪂</text>
  </svg>`;

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

  return new NextResponse(pngBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
