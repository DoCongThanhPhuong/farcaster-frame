'use client';

import { useState } from 'react';
import { Bookmark, Check } from 'lucide-react';
import sdk from '@farcaster/frame-sdk';
import { I18N, LOCALES, LOCALE_META, type Locale } from '@/lib/i18n';

interface NavbarProps {
  locale: Locale;
  onLocaleChange: (next: Locale) => void;
  user: {
    fid?: number;
    username?: string;
    pfpUrl?: string;
  } | null;
  isInMiniApp: boolean;
}

export function Navbar({ locale, onLocaleChange, user, isInMiniApp }: NavbarProps) {
  const [pinned, setPinned] = useState(false);
  const t = I18N[locale];

  const handleAddMiniApp = async () => {
    try {
      if ('addFrame' in sdk.actions && typeof sdk.actions.addFrame === 'function') {
        await sdk.actions.addFrame();
        setPinned(true);
      }
    } catch {}
  };

  return (
    <header className="w-full border-b border-line bg-surface sticky top-0 z-40 px-3 sm:px-6 pt-[env(safe-area-inset-top)]">
      <div className="max-w-6xl mx-auto h-13 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shrink-0 relative overflow-hidden"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none">
              <path
                d="M13.5 2.5L5.5 13h5.2l-1.2 8.5L18.5 11h-5.3L13.5 2.5Z"
                fill="#FFFFFF"
              />
            </svg>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-signal" />
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <span className="font-extrabold text-sm tracking-tight text-ink whitespace-nowrap">
              FARBASE RUSH
            </span>
            <span className="hidden md:inline-block w-px h-3.5 bg-line-strong" aria-hidden="true" />
            <span className="hidden md:inline text-xs text-ink-muted truncate">
              {t.brandSubtitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div
            role="group"
            aria-label={t.langLabel}
            className="flex items-center rounded-lg bg-canvas border border-line p-0.5"
          >
            {LOCALES.map((code) => {
              const active = code === locale;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => onLocaleChange(code)}
                  aria-pressed={active}
                  title={LOCALE_META[code]}
                  className={`min-w-[32px] min-h-[30px] px-2 rounded-md text-[11px] font-bold tracking-wide transition-colors ${
                    active
                      ? 'bg-elevated text-ink border border-line-strong'
                      : 'text-ink-muted hover:text-ink border border-transparent'
                  }`}
                >
                  {code.toUpperCase()}
                </button>
              );
            })}
          </div>

          {user?.fid ? (
            <div
              className="hidden sm:flex items-center gap-1.5 pl-1.5 pr-2.5 h-8 rounded-lg bg-canvas border border-line text-xs text-ink max-w-[150px]"
              title={user.username ? `@${user.username} (#${user.fid})` : `FID #${user.fid}`}
            >
              {user.pfpUrl ? (
                <img
                  src={user.pfpUrl}
                  alt=""
                  className="w-5 h-5 rounded-full object-cover border border-line-strong shrink-0"
                />
              ) : (
                <span className="w-5 h-5 rounded-full bg-elevated text-ink-secondary text-[10px] font-bold flex items-center justify-center shrink-0">
                  {(user.username || 'F')[0].toUpperCase()}
                </span>
              )}
              <span className="font-medium truncate">
                {user.username ? `@${user.username}` : `#${user.fid}`}
              </span>
            </div>
          ) : null}

          {isInMiniApp && (
            <button
              type="button"
              onClick={handleAddMiniApp}
              disabled={pinned}
              aria-label={pinned ? t.pinned : t.pinApp}
              className={`min-h-[32px] px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                pinned
                  ? 'border-ok/40 bg-ok/10 text-ok cursor-default'
                  : 'border-line-strong bg-elevated hover:bg-elevated-hover text-ink'
              }`}
            >
              {pinned ? (
                <Check className="w-3.5 h-3.5 text-ok" aria-hidden="true" />
              ) : (
                <Bookmark className="w-3.5 h-3.5 text-ink-secondary" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">{pinned ? t.pinned : t.pinApp}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
