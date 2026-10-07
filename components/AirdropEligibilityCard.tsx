'use client';

import { ShieldCheck, Trophy, Zap, Flame } from 'lucide-react';

interface EligibilityProps {
  fid: number | null;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  isWalletConnected: boolean;
  streakDays: number;
  hasMintedPass: boolean;
  onFidChange?: (fid: number) => void;
  isInMiniApp: boolean;
}

export function AirdropEligibilityCard({
  fid,
  username,
  displayName,
  pfpUrl,
  isWalletConnected,
  streakDays,
  hasMintedPass,
  onFidChange,
  isInMiniApp,
}: EligibilityProps) {
  const currentFid = fid || 34105;

  // Seniority points
  let fidPoints = 1200;
  if (currentFid < 10000) fidPoints = 8500;
  else if (currentFid < 50000) fidPoints = 4800;
  else if (currentFid < 200000) fidPoints = 2600;

  // Multipliers
  let multiplier = 1.0;
  if (isWalletConnected) multiplier += 0.3;
  if (streakDays > 0) multiplier += streakDays * 0.15;
  if (hasMintedPass) multiplier += 0.5;

  const totalPoints = Math.round(fidPoints * multiplier);
  const estimatedFarTokens = (totalPoints * 0.42).toFixed(1);

  let tier = 'Early Adopter';
  let tierColor = 'text-blue-400 border-blue-500/40 bg-blue-950/30';
  if (totalPoints > 10000) {
    tier = 'OG Legend';
    tierColor = 'text-yellow-400 border-yellow-500/40 bg-yellow-950/30';
  } else if (totalPoints > 5000) {
    tier = 'Pro Builder';
    tierColor = 'text-purple-400 border-purple-500/40 bg-purple-950/30';
  }

  return (
    <div className="bg-[#141522] border border-gray-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* User Header */}
      <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-800/80">
        <div className="flex items-center gap-3">
          {pfpUrl ? (
            <img
              src={pfpUrl}
              alt={username || 'User'}
              className="w-12 h-12 rounded-full border-2 border-purple-500/50 object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-700 to-indigo-900 border-2 border-purple-500/40 flex items-center justify-center text-lg font-bold text-white">
              {username ? username.charAt(0).toUpperCase() : '#'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-base">
                {displayName || username || 'Warpcast Explorer'}
              </h2>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tierColor}`}>
                {tier}
              </span>
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
              <span>FID: #{currentFid}</span>
              {username && <span>• @{username}</span>}
              {!isInMiniApp && (
                <span className="text-[10px] bg-gray-800 px-1 rounded text-gray-400">Preview Mode</span>
              )}
            </p>
          </div>
        </div>

        {!isInMiniApp && onFidChange && (
          <div className="flex items-center gap-1">
            <input
              type="number"
              placeholder="Custom FID"
              className="w-24 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              defaultValue={currentFid}
              onBlur={(e) => {
                const val = parseInt(e.target.value);
                if (val > 0) onFidChange(val);
              }}
            />
          </div>
        )}
      </div>

      {/* Main Score Display */}
      <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-blue-950/40 border border-purple-800/30 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            TOTAL AIRDROP SCORE
          </span>
          <span className="text-xs font-bold text-purple-300">
            Multiplier: {multiplier.toFixed(2)}x
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {totalPoints.toLocaleString()} <span className="text-sm font-medium text-purple-300">PTS</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-emerald-400">
              ~{estimatedFarTokens} $BUILD
            </div>
            <div className="text-[10px] text-gray-400">Est. Allocation</div>
          </div>
        </div>

        {/* Progress to next tier */}
        <div className="w-full bg-gray-800/80 rounded-full h-1.5 mt-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (totalPoints / 12000) * 100)}%` }}
          />
        </div>
      </div>

      {/* Multipliers & Tasks Grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-2.5">
          <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 text-purple-400" />
            Seniority
          </div>
          <div className="text-sm font-bold text-gray-200">+{fidPoints} pts</div>
          <div className="text-[10px] text-gray-500">FID #{currentFid}</div>
        </div>

        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-2.5">
          <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
            <Flame className="w-3 h-3 text-amber-500" />
            Streak
          </div>
          <div className="text-sm font-bold text-gray-200">
            {streakDays > 0 ? `+${(streakDays * 0.15).toFixed(2)}x` : '0x'}
          </div>
          <div className="text-[10px] text-gray-500">{streakDays} Day active</div>
        </div>

        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-2.5">
          <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-blue-400" />
            Pass Mint
          </div>
          <div className={`text-sm font-bold ${hasMintedPass ? 'text-emerald-400' : 'text-gray-400'}`}>
            {hasMintedPass ? '+0.5x Active' : 'Unminted'}
          </div>
          <div className="text-[10px] text-gray-500">Base Onchain</div>
        </div>
      </div>
    </div>
  );
}
