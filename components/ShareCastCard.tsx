'use client';

import { useState } from 'react';
import { Share2, Check, Link2, Swords } from 'lucide-react';
import sdk from '@farcaster/frame-sdk';
import { I18N, type Locale } from '@/lib/i18n';

export function getAppUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_HOST
    ? `https://${process.env.NEXT_PUBLIC_HOST}`
    : 'https://farcaster-frame-sepia.vercel.app';
}

export async function shareCast(text: string): Promise<void> {
  const appUrl = getAppUrl();

  try {
    if (typeof sdk.actions.composeCast === 'function') {
      await sdk.actions.composeCast({ text, embeds: [appUrl] });
      return;
    }
  } catch {}

  const composeUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(appUrl)}`;
  try {
    if (typeof sdk.actions.openUrl === 'function') {
      await sdk.actions.openUrl(composeUrl);
      return;
    }
  } catch {}

  window.open(composeUrl, '_blank', 'noopener,noreferrer');
}

interface ShareCastCardProps {
  locale: Locale;
  highScore: number;
  day: number;
}

export function ShareCastCard({ locale, highScore, day }: ShareCastCardProps) {
  const [copied, setCopied] = useState(false);
  const t = I18N[locale];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getAppUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <section className="arcade-cabinet rounded-2xl p-4 sm:p-5">
      <div className="flex items-start gap-3 mb-3.5">
        <div
          className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/35 flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <Swords className="w-4 h-4 text-violet-300" />
        </div>
        <div>
          <h2 className="font-bold text-white text-sm">{t.shareTitle}</h2>
          <p className="text-xs text-slate-300 mt-0.5">{t.shareDesc}</p>
        </div>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
        <button
          type="button"
          onClick={() => shareCast(t.castInvite(highScore, day))}
          className="flex-1 min-h-[44px] px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-950/50 transition-colors"
        >
          <Share2 className="w-4 h-4" aria-hidden="true" />
          <span>{t.shareBtn}</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="min-h-[44px] px-3.5 rounded-xl border border-[var(--border-subtle)] bg-[#12152a] hover:bg-[#191d38] text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          ) : (
            <Link2 className="w-4 h-4 text-slate-400" aria-hidden="true" />
          )}
          <span>{copied ? t.copiedBtn : t.copyBtn}</span>
        </button>
      </div>
    </section>
  );
}
