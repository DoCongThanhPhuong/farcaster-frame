import { NextResponse } from 'next/server';
import sharp from 'sharp';

export async function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0a0a10"/>
        <stop offset="50%" stop-color="#141324"/>
        <stop offset="100%" stop-color="#1b1130"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <circle cx="1050" cy="150" r="300" fill="#855DCD" opacity="0.12"/>
    <circle cx="150" cy="480" r="260" fill="#0052FF" opacity="0.1"/>
    <rect x="50" y="50" width="1100" height="530" rx="32" fill="#13141f" stroke="#2e2b44" stroke-width="2"/>
    
    <g transform="translate(90, 110)">
      <rect width="180" height="42" rx="21" fill="#855DCD" opacity="0.25"/>
      <text x="90" y="27" text-anchor="middle" fill="#C4B5FD" font-size="18" font-weight="bold" font-family="-apple-system, sans-serif">🟣 FARCASTER</text>

      <g transform="translate(195, 0)">
        <rect width="140" height="42" rx="21" fill="#0052FF" opacity="0.25"/>
        <text x="70" y="27" text-anchor="middle" fill="#60A5FA" font-size="18" font-weight="bold" font-family="-apple-system, sans-serif">🔵 BASE</text>
      </g>
    </g>

    <text x="90" y="240" fill="#ffffff" font-size="54" font-weight="800" font-family="-apple-system, sans-serif">
      Farcaster &amp; Base Builder Airdrop
    </text>
    <text x="90" y="300" fill="#9CA3AF" font-size="24" font-family="-apple-system, sans-serif">
      Daily Check-in • Onchain Badges • Multiplier Calculation
    </text>

    <g transform="translate(90, 390)">
      <rect width="450" height="110" rx="16" fill="#1b1c2b" stroke="#2e3044"/>
      <text x="30" y="45" fill="#FBBF24" font-size="22" font-weight="bold" font-family="-apple-system, sans-serif">🔥 Daily Active Streaks</text>
      <text x="30" y="80" fill="#9CA3AF" font-size="16" font-family="-apple-system, sans-serif">Build daily engagement on Warpcast</text>

      <g transform="translate(480, 0)">
        <rect width="450" height="110" rx="16" fill="#1b1c2b" stroke="#2e3044"/>
        <text x="30" y="45" fill="#34D399" font-size="22" font-weight="bold" font-family="-apple-system, sans-serif">⚡ Onchain Base Mint</text>
        <text x="30" y="80" fill="#9CA3AF" font-size="16" font-family="-apple-system, sans-serif">Claim verified builder pass with Wagmi</text>
      </g>
    </g>
  </svg>`;

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

  return new NextResponse(pngBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
