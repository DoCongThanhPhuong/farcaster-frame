'use client';

import { useState } from 'react';
import { X, Coins, Info, ShieldCheck, Flame, Trophy } from 'lucide-react';

export function BuilderAirdropGuideModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-2.5 px-4 rounded-xl border border-dashed border-gray-700 bg-gray-900/30 hover:bg-gray-800/40 text-gray-300 font-semibold text-xs flex items-center justify-center gap-2 transition"
      >
        <Info className="w-4 h-4 text-blue-400" />
        <span>About This App &amp; Builder Rewards Guide</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#13141f] border border-gray-800 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-5 relative shadow-2xl space-y-4 text-xs text-gray-300">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <h3 className="font-bold text-white text-base">
                  Farcaster &amp; Base Builder Hub
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl space-y-1">
              <p className="font-semibold text-purple-200">What is this Mini App?</p>
              <p className="text-gray-300">
                A verified Farcaster Mini App on Base L2 designed to reward builders, drive daily engagement (DAU), and generate onchain transactions for ecosystem builder grants.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider text-gray-400">
                How to Earn &amp; Maximize Your Score
              </h4>

              <div className="flex gap-3 items-start p-2.5 rounded-xl bg-gray-900/50 border border-gray-800">
                <div className="w-7 h-7 rounded-lg bg-blue-900/40 text-blue-300 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">1. Connect &amp; Seniority Points</p>
                  <p className="text-gray-400">Early Farcaster IDs receive higher base points. Connect your wallet to unlock a +0.3x multiplier.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-2.5 rounded-xl bg-gray-900/50 border border-gray-800">
                <div className="w-7 h-7 rounded-lg bg-amber-900/40 text-amber-300 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">2. Maintain Daily Streaks</p>
                  <p className="text-gray-400">Check in every 24 hours. Each streak day adds +0.15x to your multiplier and qualifies for Moxie daily rewards.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-2.5 rounded-xl bg-gray-900/50 border border-gray-800">
                <div className="w-7 h-7 rounded-lg bg-indigo-900/40 text-indigo-300 flex items-center justify-center shrink-0">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">3. Mint Onchain Pass on Base</p>
                  <p className="text-gray-400">Free mint on Base L2 (+0.5x multiplier). Generates real onchain volume required for Base Builder Grants.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-2.5 rounded-xl bg-gray-900/50 border border-gray-800">
                <div className="w-7 h-7 rounded-lg bg-purple-900/40 text-purple-300 flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">4. Play FarBase Rush Arcade</p>
                  <p className="text-gray-400">Conquer troll traps and score 100+ points to earn an extra +0.2x multiplier and share your death count to feed.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold transition"
              >
                Close &amp; Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
