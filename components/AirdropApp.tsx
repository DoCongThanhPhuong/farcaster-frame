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
    <div className="min-h-dvh flex flex-col bg-canvas">
      <Navbar
        locale={locale}
        onLocaleChange={handleLocaleChange}
        user={user}
        isInMiniApp={isInMiniApp}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-3 sm:py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-4 lg:gap-6 items-start">
          <BaseMarioGame
            locale={locale}
            fid={activeFid}
            onHighScoreChange={setGameHighScore}
            onDailyRunEnd={setLastDailyRun}
          />

          <aside className="space-y-4 lg:sticky lg:top-18">
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

            {sdkChecked && !isInMiniApp && (
              <div
                role="note"
                className="rounded-lg border border-line bg-surface px-3.5 py-3 text-xs text-ink-secondary flex items-start gap-2.5 leading-relaxed"
              >
                <Info className="w-4 h-4 text-brand-bright shrink-0 mt-0.5" aria-hidden="true" />
                <span>{t.webPreviewBanner}</span>
              </div>
            )}
          </aside>
        </div>
      </main>

      <footer className="border-t border-line py-3 px-4 text-center text-xs text-ink-muted">
        {t.footer}
      </footer>
    </div>
  );
}
