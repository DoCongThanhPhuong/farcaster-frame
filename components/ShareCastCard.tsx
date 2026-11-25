'use client';

import { useState } from 'react';
import { Share2, Check, Link2 } from 'lucide-react';
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
    <section className="bg-surface border border-line rounded-xl p-4">
      <h2 className="font-bold text-ink text-sm">{t.shareTitle}</h2>
      <p className="text-xs text-ink-secondary mt-1 mb-3.5 leading-relaxed">{t.shareDesc}</p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => shareCast(t.castInvite(highScore, day))}
          className="flex-1 min-h-[40px] px-3.5 rounded-lg bg-brand hover:bg-brand-bright text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t.shareBtn}</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="min-h-[40px] px-3 rounded-lg border border-line-strong bg-elevated hover:bg-elevated-hover text-ink font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-ok" aria-hidden="true" />
          ) : (
            <Link2 className="w-3.5 h-3.5 text-ink-secondary" aria-hidden="true" />
          )}
          <span>{copied ? t.copiedBtn : t.copyBtn}</span>
        </button>
      </div>
    </section>
  );
}
