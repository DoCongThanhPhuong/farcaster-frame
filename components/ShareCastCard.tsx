'use client';

import { useState } from 'react';
import { Share2, Check, Sparkles } from 'lucide-react';
import sdk from '@farcaster/frame-sdk';

interface ShareCastCardProps {
  fid: number | null;
  streakDays: number;
}

export function ShareCastCard({ fid, streakDays }: ShareCastCardProps) {
  const [copied, setCopied] = useState(false);

  const handleShareCast = async () => {
    const text = `Just checked my Builder Airdrop score on @farcaster! 🚀\n🔥 Current streak: ${streakDays} days\nCheck your allocation & claim your daily streak:`;
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://farcaster-frame.vercel.app';

    // 1. Try Warpcast Mini App native cast composer
    try {
      if (typeof sdk.actions.composeCast === 'function') {
        await sdk.actions.composeCast({
          text,
          embeds: [appUrl],
        });
        return;
      }
    } catch (err) {
      console.warn('Native cast compose failed, falling back to URL:', err);
    }

    // 2. Fallback to Warpcast compose URL
    const composeUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(appUrl)}`;
    try {
      if (typeof sdk.actions.openUrl === 'function') {
        await sdk.actions.openUrl(composeUrl);
        return;
      }
    } catch {}

    window.open(composeUrl, '_blank');
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-950/40 via-[#161726] to-blue-950/40 border border-purple-800/30 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <h3 className="font-bold text-white text-sm">Boost Viral Engagement</h3>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Share your streak to Warpcast. Organic casts drive engagement and builder grant allocations.
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={handleShareCast}
          className="flex-1 py-2.5 px-4 rounded-xl bg-[#855DCD] hover:bg-[#734bc0] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-950/40 transition"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share Cast to Warpcast
        </button>

        <button
          onClick={handleCopyLink}
          className="py-2.5 px-3.5 rounded-xl border border-gray-700 bg-gray-900/80 hover:bg-gray-800 text-gray-300 font-semibold text-xs flex items-center gap-1.5 transition"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : null}
          {copied ? 'Copied' : 'Copy Frame Link'}
        </button>
      </div>
    </div>
  );
}
