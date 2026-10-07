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

  useEffect(() => {
    // 1. Restore local data
    try {
      const savedStreak = localStorage.getItem('fc_airdrop_streak');
      if (savedStreak) setStreakDays(parseInt(savedStreak, 10) || 0);

      const savedPass = localStorage.getItem('fc_airdrop_has_minted_pass');
      if (savedPass === 'true') setHasMintedPass(true);
    } catch {}

    // 2. Initialize Farcaster Mini App SDK
    const initSdk = async () => {
      try {
        const inMiniApp = typeof (sdk as any).isInMiniApp === 'function' ? (sdk as any).isInMiniApp() : true;
        setIsInMiniApp(inMiniApp);

        // Tell Warpcast the Mini App has loaded and can hide the splash screen
        if (typeof sdk.actions.ready === 'function') {
          await sdk.actions.ready();
        }

        // Fetch context
        const context = await sdk.context;
        if (context?.user) {
          setUser({
            fid: context.user.fid,
            username: context.user.username,
            displayName: context.user.displayName,
            pfpUrl: context.user.pfpUrl,
          });
        }
      } catch (err) {
        console.warn('Farcaster SDK init outside Warpcast:', err);
      }
    };

    initSdk();
  }, []);

  const handlePassMinted = () => {
    setHasMintedPass(true);
    try {
      localStorage.setItem('fc_airdrop_has_minted_pass', 'true');
    } catch {}
  };

  const handleCheckIn = (newStreak: number) => {
    setStreakDays(newStreak);
  };

  const activeFid = customFid || user?.fid || null;

  return (
    <div className="min-h-screen bg-[#0c0d16] text-gray-100 flex flex-col">
      <Navbar user={user} isInMiniApp={isInMiniApp} />

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 space-y-4">
        {/* Banner notification if preview mode */}
        {!isInMiniApp && (
          <div className="bg-purple-950/40 border border-purple-800/40 rounded-xl p-3 text-xs text-purple-200 flex items-center justify-between">
            <span>✨ Đang xem ở chế độ Web Browser. Khi mở trên Warpcast, ứng dụng tự động nhận diện FID và ví in-app.</span>
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
          onFidChange={(f) => setCustomFid(f)}
          isInMiniApp={isInMiniApp}
        />

        <DailyStreakCard
          streakDays={streakDays}
          onCheckIn={handleCheckIn}
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

        <footer className="text-center text-[11px] text-gray-500 py-4">
          Farcaster Frame v2 / Mini App • Built for Farcaster &amp; Base Builder Ecosystem
        </footer>
      </main>
    </div>
  );
}
