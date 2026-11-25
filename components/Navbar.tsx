'use client';

import { useState } from 'react';
import { Bookmark, Check, Globe } from 'lucide-react';
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
    } catch (err) {
      console.warn('Failed to pin app:', err);
    }
  };

  return (
    <header className="w-full border-b border-[var(--border-subtle)] bg-[#090b18]/90 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-4 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))]">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-500 p-[1px] shadow-lg shadow-violet-950/50 shrink-0"
            aria-hidden="true"
          >
            <div className="w-full h-full rounded-[11px] bg-[#0b0d1d] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                <path
                  d="M13.5 2L5 13.2h5.6L9.5 22L19 10.4h-5.8L13.5 2Z"
                  fill="url(#fb-bolt)"
                  stroke="#E2E8F0"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="fb-bolt" x1="5" y1="2" x2="19" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#38BDF8" />
                    <stop offset="0.55" stopColor="#A78BFA" />
                    <stop offset="1" stopColor="#F43F5E" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base text-white tracking-wider">
                FARBASE
              </span>
              <span className="text-[10px] font-extrabold tracking-widest px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/35">
                RUSH
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate hidden xs:block sm:block">
              {t.brandSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div
            role="group"
            aria-label={t.langLabel}
            className="flex items-center rounded-xl bg-[#12152a] border border-[var(--border-subtle)] p-0.5"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1 hidden sm:block" aria-hidden="true" />
            {LOCALES.map((code) => {
              const active = code === locale;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => onLocaleChange(code)}
                  aria-pressed={active}
                  title={LOCALE_META[code]}
                  className={`min-w-[34px] min-h-[34px] px-2 rounded-lg text-[11px] font-bold tracking-wide transition-colors duration-150 ${
                    active
                      ? 'bg-violet-600 text-white shadow-sm shadow-violet-950/60'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                  }`}
                >
                  {code.toUpperCase()}
                </button>
              );
            })}
          </div>

          {user?.fid ? (
            <div
              className="hidden sm:flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-xl bg-[#12152a] border border-[var(--border-subtle)] text-xs text-slate-200 max-w-[140px]"
              title={user.username ? `@${user.username} (#${user.fid})` : `FID #${user.fid}`}
            >
              {user.pfpUrl ? (
                <img
                  src={user.pfpUrl}
                  alt=""
                  className="w-5 h-5 rounded-full object-cover border border-violet-400/40 shrink-0"
                />
              ) : (
                <span className="w-5 h-5 rounded-full bg-violet-600/40 text-violet-200 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {(user.username || 'F')[0].toUpperCase()}
                </span>
              )}
              <span className="font-semibold truncate">
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
              className={`min-h-[36px] px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors duration-150 ${
                pinned
                  ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300 cursor-default'
                  : 'border-violet-500/40 bg-violet-950/35 hover:bg-violet-900/45 text-violet-200'
              }`}
            >
              {pinned ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              ) : (
                <Bookmark className="w-3.5 h-3.5 text-violet-300" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">{pinned ? t.pinned : t.pinApp}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
