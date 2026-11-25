'use client';

import { useEffect, useState } from 'react';
import sdk from '@farcaster/frame-sdk';
import { Info } from 'lucide-react';
import { Navbar } from './Navbar';
import { BaseMarioGame } from './BaseMarioGame';
import { DailyLeaderboard, type DailyRun } from './DailyLeaderboard';
import { ShareCastCard } from './ShareCastCard';
import { dailyNumber } from '@/lib/levels';
import { detectLocale, I18N, saveLocale, type Locale } from '@/lib/i18n';

export function AirdropApp() {
  const [locale, setLocale] = useState<Locale>('vi');
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [sdkChecked, setSdkChecked] = useState(false);
  const [user, setUser] = useState<{
    fid?: number;
    username?: string;
    pfpUrl?: string;
  } | null>(null);

  const [gameHighScore, setGameHighScore] = useState(0);
  const [lastDailyRun, setLastDailyRun] = useState<DailyRun | null>(null);

  const activeFid = user?.fid ?? null;
  const t = I18N[locale];

  useEffect(() => {
    const detected = detectLocale();
    setLocale(detected);
    saveLocale(detected);
  }, []);

  const handleLocaleChange = (next: Locale) => {
    setLocale(next);
    saveLocale(next);
  };

  useEffect(() => {
    try {
      const key = activeFid ? `fc_farbase_highscore_${activeFid}` : 'fc_farbase_highscore';
      const saved = localStorage.getItem(key);
      if (saved) setGameHighScore(parseInt(saved, 10) || 0);
    } catch {}
  }, [activeFid]);

  useEffect(() => {
    const initSdk = async () => {
      try {
        const context = await sdk.context;
        const inMiniApp = Boolean(context?.client);
        setIsInMiniApp(inMiniApp);

        if (typeof sdk.actions.ready === 'function') {
          await sdk.actions.ready();
        }

        if (context?.user) {
          setUser({
            fid: context.user.fid,
            username: context.user.username,
            pfpUrl: context.user.pfpUrl,
          });
        }
      } catch {
        setIsInMiniApp(false);
      } finally {
        setSdkChecked(true);
      }
    };

    initSdk();
  }, []);

  const currentDay = dailyNumber();

  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar
        locale={locale}
        onLocaleChange={handleLocaleChange}
        user={user}
        isInMiniApp={isInMiniApp}
      />

      <main className="flex-1 max-w-2xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {sdkChecked && !isInMiniApp && (
          <div
            role="note"
            className="rounded-xl border border-sky-500/25 bg-sky-950/25 px-3.5 py-2.5 text-xs text-sky-200/90 flex items-start gap-2.5"
          >
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{t.webPreviewBanner}</span>
          </div>
        )}

        <BaseMarioGame
          locale={locale}
          fid={activeFid}
          onHighScoreChange={setGameHighScore}
          onDailyRunEnd={setLastDailyRun}
        />

        <DailyLeaderboard
          locale={locale}
          day={lastDailyRun?.day ?? currentDay}
          isInMiniApp={isInMiniApp}
          username={user?.username}
          fid={activeFid}
          lastRun={lastDailyRun}
        />

        <ShareCastCard
          locale={locale}
          highScore={gameHighScore}
          day={currentDay}
        />

        <footer className="text-center text-[11px] text-slate-400 pt-1 pb-2">
          {t.footer}
        </footer>
      </main>
    </div>
  );
}
