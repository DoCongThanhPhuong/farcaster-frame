'use client';

import { useState, useEffect } from 'react';
import { Flame, CheckCircle, Clock, Sparkles } from 'lucide-react';
import sdk from '@farcaster/frame-sdk';

interface DailyStreakCardProps {
  streakDays: number;
  onCheckIn: (newStreak: number) => void;
  fid?: number | null;
}

export function DailyStreakCard({ streakDays, onCheckIn, fid }: DailyStreakCardProps) {
  const [canClaim, setCanClaim] = useState(true);
  const [hoursRemaining, setHoursRemaining] = useState<number | null>(null);

  useEffect(() => {
    const lastCheckinKey = fid ? `fc_last_checkin_${fid}` : 'fc_airdrop_last_checkin';
    const streakKey = fid ? `fc_streak_${fid}` : 'fc_airdrop_streak';
    try {
      const lastCheckIn = localStorage.getItem(lastCheckinKey) || localStorage.getItem('fc_airdrop_last_checkin');
      if (lastCheckIn) {
        const lastTime = parseInt(lastCheckIn, 10);
        const now = Date.now();
        const diffMs = now - lastTime;
        const cooldown = 24 * 60 * 60 * 1000; // 24 hours

        // If missed check-in by more than 48 hours, streak resets
        if (diffMs > 48 * 60 * 60 * 1000 && streakDays > 0) {
          onCheckIn(0);
          localStorage.setItem(streakKey, '0');
        }

        if (diffMs < cooldown) {
          setCanClaim(false);
          const remHours = Math.ceil((cooldown - diffMs) / (1000 * 60 * 60));
          setHoursRemaining(remHours);
        } else {
          setCanClaim(true);
        }
      }
    } catch {}
  }, [streakDays, fid]);

  const handleClaim = () => {
    const lastCheckinKey = fid ? `fc_last_checkin_${fid}` : 'fc_airdrop_last_checkin';
    const streakKey = fid ? `fc_streak_${fid}` : 'fc_airdrop_streak';
    let nextStreak = 1;
    try {
      const lastCheckIn = localStorage.getItem(lastCheckinKey) || localStorage.getItem('fc_airdrop_last_checkin');
      const lastTime = lastCheckIn ? parseInt(lastCheckIn, 10) : 0;
      const now = Date.now();
      const diffMs = now - lastTime;
      const missedStreak = lastTime > 0 && diffMs > 48 * 60 * 60 * 1000;
      nextStreak = missedStreak || streakDays === 0 ? 1 : streakDays + 1;

      localStorage.setItem(lastCheckinKey, now.toString());
      localStorage.setItem(streakKey, nextStreak.toString());
    } catch {
      nextStreak = streakDays + 1;
    }
    // Trigger haptics if on mobile Warpcast
    try {
      if ('haptics' in sdk && sdk.haptics && typeof sdk.haptics === 'object' && 'notificationOccurred' in sdk.haptics && typeof sdk.haptics.notificationOccurred === 'function') {
        sdk.haptics.notificationOccurred('success');
      }
    } catch {}

    onCheckIn(nextStreak);
    setCanClaim(false);
    setHoursRemaining(24);
  };

  const days = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="bg-[#141522] border border-gray-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Flame className="w-5 h-5 fill-amber-500/20" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Daily Builder Check-in</h3>
            <p className="text-xs text-gray-400">Streaks boost DAU &amp; grant multipliers</p>
          </div>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-amber-950/40 border border-amber-600/30 text-amber-300 font-bold text-xs flex items-center gap-1">
          <Flame className="w-3.5 h-3.5" />
          {streakDays} Day Streak
        </div>
      </div>

      {/* 7-Day Visual Tracker */}
      <div className="grid grid-cols-7 gap-1.5 mb-5">
        {days.map((day) => {
          const isDone = day <= streakDays;
          const isCurrent = day === streakDays + 1 && canClaim;
          return (
            <div
              key={day}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition ${
                isDone
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : isCurrent
                  ? 'bg-purple-950/40 border-purple-500 text-purple-200 animate-pulse'
                  : 'bg-gray-900/40 border-gray-800 text-gray-500'
              }`}
            >
              <span className="text-[10px] font-semibold mb-1">D{day}</span>
              {isDone ? (
                <CheckCircle className="w-4 h-4 text-amber-400" />
              ) : (
                <span className="text-xs font-bold">+{day * 50}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Claim Action Button */}
      <button
        onClick={handleClaim}
        disabled={!canClaim}
        className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
          canClaim
            ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 text-white shadow-lg shadow-orange-900/30'
            : 'bg-gray-800 text-gray-400 border border-gray-700/60 cursor-not-allowed'
        }`}
      >
        {canClaim ? (
          <>
            <Sparkles className="w-4 h-4" />
            Claim Day {streakDays + 1} Check-in (+{(streakDays + 1) * 50} pts)
          </>
        ) : (
          <>
            <Clock className="w-4 h-4" />
            Claimed Today (Next in ~{hoursRemaining || 24}h)
          </>
        )}
      </button>
    </div>
  );
}
