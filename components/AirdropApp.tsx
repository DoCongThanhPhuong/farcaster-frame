'use client';

import { useEffect, useState } from 'react';
import sdk from '@farcaster/frame-sdk';
import { useAccount } from 'wagmi';
import { Navbar } from './Navbar';
import { AirdropEligibilityCard } from './AirdropEligibilityCard';
import { DailyStreakCard } from './DailyStreakCard';
import { OnchainMintCard } from './OnchainMintCard';
import { ShareCastCard } from './ShareCastCard';
import { BuilderAirdropGuideModal } from './BuilderAirdropGuideModal';
import { BaseMarioGame } from './BaseMarioGame';

export function AirdropApp() {
  const { isConnected } = useAccount();
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [user, setUser] = useState<{
    fid?: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  } | null>(null);

  const [customFid, setCustomFid] = useState<number | null>(null);
  const [streakDays, setStreakDays] = useState(0);
  const [hasMintedPass, setHasMintedPass] = useState(false);
  const [activeTab, setActiveTab] = useState<'airdrop' | 'game'>('airdrop');
  const [gameHighScore, setGameHighScore] = useState(0);

  const activeFid = customFid || user?.fid || null;

  useEffect(() => {
    try {
      const streakKey = activeFid ? `fc_streak_${activeFid}` : 'fc_airdrop_streak';
      const passKey = activeFid ? `fc_pass_${activeFid}` : 'fc_airdrop_has_minted_pass';
      const savedStreak = localStorage.getItem(streakKey) || localStorage.getItem('fc_airdrop_streak');
      if (savedStreak) setStreakDays(parseInt(savedStreak, 10) || 0);

      const savedPass = localStorage.getItem(passKey) || localStorage.getItem('fc_airdrop_has_minted_pass');
      if (savedPass === 'true') setHasMintedPass(true);

      const gameKey = activeFid ? `fc_mario_highscore_${activeFid}` : 'fc_mario_highscore';
      const savedGame = localStorage.getItem(gameKey);
      if (savedGame) setGameHighScore(parseInt(savedGame, 10) || 0);
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

        // Fetch context
        if (context?.user) {
          setUser({
            fid: context.user.fid,
            username: context.user.username,
            displayName: context.user.displayName,
            pfpUrl: context.user.pfpUrl,
          });
        }
      } catch (err) {
        setIsInMiniApp(false);
        console.warn('Farcaster SDK init outside Warpcast:', err);
      }
    };

    initSdk();
  }, []);
  const handlePassMinted = () => {
    setHasMintedPass(true);
    try {
      const passKey = activeFid ? `fc_pass_${activeFid}` : 'fc_airdrop_has_minted_pass';
      localStorage.setItem(passKey, 'true');
    } catch {}
  };

  const handleCheckIn = (newStreak: number) => {
    setStreakDays(newStreak);
  };

  return (
    <div className="min-h-screen bg-[#0c0d16] text-gray-100 flex flex-col">
      <Navbar user={user} isInMiniApp={isInMiniApp} />

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 space-y-4">
        {!isInMiniApp && (
          <div className="bg-purple-950/40 border border-purple-800/40 rounded-xl p-3 text-xs text-purple-200 flex items-center justify-between">
            <span>✨ Viewing in Web Browser mode. When opened in Warpcast, your FID and wallet are auto-detected.</span>
          </div>
        )}

        <AirdropEligibilityCard
          fid={activeFid}
          username={user?.username}
          displayName={user?.displayName}
          pfpUrl={user?.pfpUrl}
          isWalletConnected={isConnected}
          streakDays={streakDays}
          hasMintedPass={hasMintedPass}
          gameHighScore={gameHighScore}
          onFidChange={(f) => setCustomFid(f)}
          isInMiniApp={isInMiniApp}
        />

        <div className="flex rounded-xl bg-gray-900/90 p-1 border border-gray-800 shadow-md">
          <button
            onClick={() => setActiveTab('airdrop')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'airdrop'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>🪂 Airdrop Tasks</span>
          </button>
          <button
            onClick={() => setActiveTab('game')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'game'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>🎮 FarBase Rush</span>
            <span className="px-1.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 text-[10px] font-extrabold">
              {gameHighScore > 0 ? `${gameHighScore} pts` : 'HOT'}
            </span>
          </button>
        </div>

        {activeTab === 'airdrop' ? (
          <>
            <DailyStreakCard
              streakDays={streakDays}
              onCheckIn={handleCheckIn}
              fid={activeFid}
            />

            <OnchainMintCard
              hasMintedPass={hasMintedPass}
              onPassMinted={handlePassMinted}
              fid={activeFid}
            />

            <ShareCastCard
              fid={activeFid}
              streakDays={streakDays}
            />

            <BuilderAirdropGuideModal />
          </>
        ) : (
          <>
            <BaseMarioGame
              fid={activeFid}
              onHighScoreChange={(s) => setGameHighScore(s)}
            />

            <ShareCastCard
              fid={activeFid}
              streakDays={streakDays}
            />
          </>
        )}

        <footer className="text-center text-[11px] text-gray-500 py-4">
          Farcaster Mini App • Built for Farcaster &amp; Base Builder Ecosystem
        </footer>
      </main>
    </div>
  );
}
