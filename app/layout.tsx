import { headers } from 'next/headers';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Providers } from './providers';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host =
    process.env.NEXT_PUBLIC_HOST ||
    headersList.get('x-forwarded-host') ||
    headersList.get('host') ||
    'localhost:3000';
  const proto = headersList.get('x-forwarded-proto') || 'https';
  const baseUrl = `${proto}://${host}`;

  const frameMetadata = {
    version: 'next',
    imageUrl: `${baseUrl}/opengraph-image`,
    button: {
      title: '🪂 Check & Claim Airdrop',
      action: {
        type: 'launch_frame',
        name: 'Farcaster Airdrop',
        url: baseUrl,
        splashImageUrl: `${baseUrl}/splash.png`,
        splashBackgroundColor: '#0d0e15',
      },
    },
  };

  return {
    title: 'Farcaster & Base Builder Airdrop',
    description:
      'Check Farcaster builder airdrop eligibility, claim daily streak, and mint verified onchain pass on Base.',
    openGraph: {
      title: 'Farcaster & Base Builder Airdrop',
      description: 'Mini App v2 on Warpcast & Base for Farcaster builder rewards.',
      images: [`${baseUrl}/opengraph-image`],
    },
    other: {
      'fc:frame': JSON.stringify(frameMetadata),
      'fc:frame:image': `${baseUrl}/opengraph-image`,
      'fc:frame:image:aspect_ratio': '1.91:1',
      'fc:frame:button:1': '🪂 Open Mini App',
      'fc:frame:button:1:action': 'link',
      'fc:frame:button:1:target': baseUrl,
      'fc:frame:post_url': `${baseUrl}/api/frame`,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0b0c13] text-gray-100 min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
