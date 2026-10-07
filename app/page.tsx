'use client';

import dynamic from 'next/dynamic';

const AirdropApp = dynamic(
  () => import('@/components/AirdropApp').then((mod) => mod.AirdropApp),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#0c0d16] flex items-center justify-center text-gray-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs">Loading Farcaster Frame...</p>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return <AirdropApp />;
}
