import { headers } from 'next/headers';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { resolveBaseUrl } from '@/lib/url';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  let hdrs: Awaited<ReturnType<typeof headers>> | null = null;
  if (!process.env.NEXT_PUBLIC_HOST) {
    try {
      hdrs = await headers();
    } catch {}
  }
  const baseUrl = resolveBaseUrl(hdrs);

  const frameMetadata = {
    version: 'next',
    imageUrl: `${baseUrl}/opengraph-image`,
    button: {
      title: 'Play FarBase Rush',
      action: {
        type: 'launch_frame',
        name: 'FarBase Rush',
        url: baseUrl,
        splashImageUrl: `${baseUrl}/splash.png`,
        splashBackgroundColor: '#0d0f12',
      },
    },
  };

  return {
    metadataBase: new URL(baseUrl),
    title: 'FarBase Rush | Trap Arcade & Daily Leaderboard',
    description:
      'Dodge hidden traps, survive collapsing bridges, and compete on the global Farcaster Daily Leaderboard.',
    icons: {
      icon: [{ url: '/icon.png', type: 'image/png' }],
      shortcut: '/icon.png',
      apple: '/icon.png',
    },
    openGraph: {
      title: 'FarBase Rush | Trap Arcade & Daily Leaderboard',
      description: 'Neon trap platformer & daily seeded leaderboard on Farcaster and Base.',
      images: [`${baseUrl}/opengraph-image`],
    },
    other: {
      'fc:frame': JSON.stringify(frameMetadata),
      'fc:frame:image': `${baseUrl}/opengraph-image`,
      'fc:frame:image:aspect_ratio': '1.91:1',
      'fc:frame:button:1': 'Play FarBase Rush',
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
    <html lang="vi">
      <body className="min-h-dvh antialiased selection:bg-brand/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
