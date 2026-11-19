'use client';

import { useEffect, useState } from 'react';
import { Trophy, Loader2 } from 'lucide-react';
import sdk from '@farcaster/frame-sdk';

interface Entry {
  rank: number;
  fid: number;
  username: string | null;
  score: number;
}

interface BoardResponse {
  configured: boolean;
  day: number;
  top: Entry[];
  me: { best: number; rank: number } | null;
  error?: string;
}

export interface DailyRun {
  day: number;
  score: number;
}

interface DailyLeaderboardProps {
  day: number;
  isInMiniApp: boolean;
  username?: string;
  fid: number | null;
  lastRun: DailyRun | null;
}

// Inside a Farcaster client, Quick Auth attaches a signed token so the server knows the real FID.
const boardFetch = (isInMiniApp: boolean, input: string, init?: RequestInit) =>
  isInMiniApp ? sdk.quickAuth.fetch(input, init) : fetch(input, init);

export function DailyLeaderboard({ day, isInMiniApp, username, fid, lastRun }: DailyLeaderboardProps) {
  const [board, setBoard] = useState<BoardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    boardFetch(isInMiniApp, `/api/leaderboard?day=${day}`)
      .then((res) => res.json())
      .then((data: BoardResponse) => !cancelled && setBoard(data))
      .catch(() => !cancelled && setStatus('Could not load the leaderboard.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [day, isInMiniApp]);

  useEffect(() => {
    if (!lastRun || lastRun.score <= 0 || lastRun.day !== day) return;
    if (!isInMiniApp) {
      setStatus('Open FarBase in Warpcast to post your score.');
      return;
    }
    let cancelled = false;
    setStatus('Posting your score…');
    boardFetch(isInMiniApp, '/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day: lastRun.day, score: lastRun.score, username }),
    })
      .then(async (res) => {
        const data: BoardResponse = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setStatus(data.error || 'Could not post your score.');
          return;
        }
        setBoard(data);
        setStatus(null);
      })
      .catch(() => !cancelled && setStatus('Could not post your score.'));
    return () => {
      cancelled = true;
    };
  }, [lastRun, day, isInMiniApp, username]);

  // No backend configured (e.g. local dev): hide the card instead of showing an empty board.
  if (board && !board.configured) return null;

  return (
    <section className="bg-[#141522] border border-gray-800 rounded-2xl p-4 shadow-xl" aria-labelledby="daily-board-title">
      <div className="flex items-center justify-between mb-3">
        <h3 id="daily-board-title" className="font-bold text-white text-sm flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          Daily #{day} Leaderboard
        </h3>
        {board?.me && (
          <span className="text-[11px] font-bold text-yellow-300 bg-yellow-950/40 border border-yellow-800/40 px-2 py-0.5 rounded-full">
            You: #{board.me.rank} · {board.me.best} pts
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-4 text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" aria-label="Loading leaderboard" />
        </div>
      ) : board?.top.length ? (
        <ol className="space-y-1">
          {board.top.map((e) => (
            <li
              key={e.fid}
              className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs ${
                e.fid === fid ? 'bg-purple-900/40 border border-purple-700/50' : 'bg-gray-900/50'
              }`}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className={`w-5 text-right font-bold ${e.rank <= 3 ? 'text-yellow-400' : 'text-gray-500'}`}>{e.rank}</span>
                <span className="text-gray-200 font-semibold truncate">{e.username ? `@${e.username}` : `FID ${e.fid}`}</span>
                {e.username && <span className="text-[10px] text-gray-500">#{e.fid}</span>}
              </span>
              <span className="font-bold text-white">{e.score}</span>
            </li>
          ))}
        </ol>
      ) : board ? (
        <p className="text-xs text-gray-400 py-2">No scores yet today. Be the first on the board!</p>
      ) : null}

      {status && <p className="text-[11px] text-gray-400 mt-2" role="status">{status}</p>}
    </section>
  );
}
