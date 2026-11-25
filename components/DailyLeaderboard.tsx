'use client';

import { useCallback, useEffect, useState } from 'react';
import { Trophy, Loader2, RefreshCw, Crown } from 'lucide-react';
import sdk from '@farcaster/frame-sdk';
import { I18N, type Locale } from '@/lib/i18n';

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
  locale: Locale;
  day: number;
  isInMiniApp: boolean;
  username?: string;
  fid: number | null;
  lastRun: DailyRun | null;
}

const boardFetch = (isInMiniApp: boolean, input: string, init?: RequestInit) =>
  isInMiniApp ? sdk.quickAuth.fetch(input, init) : fetch(input, init);

type BoardStatusKey = 'boardLoadErr' | 'boardOpenWarpcast' | 'boardPosting' | 'boardPostErr';

export function DailyLeaderboard({
  locale,
  day,
  isInMiniApp,
  username,
  fid,
  lastRun,
}: DailyLeaderboardProps) {
  const [board, setBoard] = useState<BoardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState<BoardStatusKey | string | null>(null);

  const t = I18N[locale];

  const loadBoard = useCallback(
    async (isManual = false) => {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      try {
        const res = await boardFetch(isInMiniApp, `/api/leaderboard?day=${day}`);
        const data: BoardResponse = await res.json();
        setBoard(data);
        setStatus(null);
      } catch {
        setStatus('boardLoadErr');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [day, isInMiniApp]
  );

  useEffect(() => {
    loadBoard(false);
  }, [loadBoard]);

  useEffect(() => {
    if (!lastRun || lastRun.score <= 0 || lastRun.day !== day) return;
    if (!isInMiniApp) {
      setStatus('boardOpenWarpcast');
      return;
    }
    let cancelled = false;
    setStatus('boardPosting');

    boardFetch(isInMiniApp, '/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day: lastRun.day, score: lastRun.score, username }),
    })
      .then(async (res) => {
        const data: BoardResponse = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setStatus(data.error || 'boardPostErr');
          return;
        }
        setBoard(data);
        setStatus(null);
      })
      .catch(() => !cancelled && setStatus('boardPostErr'));

    return () => {
      cancelled = true;
    };
  }, [lastRun, day, isInMiniApp, username]);

  if (board && !board.configured) return null;

  const statusText = status ? (status in t ? (t[status as BoardStatusKey] as string) : status) : null;

  const rankBadgeStyle = (rank: number) => {
    if (rank === 1) return 'bg-amber-400/20 text-amber-300 border-amber-400/50';
    if (rank === 2) return 'bg-slate-300/15 text-slate-200 border-slate-300/40';
    if (rank === 3) return 'bg-orange-400/15 text-orange-300 border-orange-400/40';
    return 'bg-slate-800/80 text-slate-400 border-slate-700/60';
  };

  return (
    <section
      className="arcade-cabinet rounded-2xl p-4 sm:p-5"
      aria-labelledby="daily-board-title"
    >
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="min-w-0">
            <h2 id="daily-board-title" className="font-bold text-white text-sm truncate">
              {t.boardTitle(day)}
            </h2>
            <p className="text-[11px] text-slate-400 truncate">{t.boardSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {board?.me && (
            <span className="tabular-nums text-xs font-bold text-amber-300 bg-amber-950/45 border border-amber-500/35 px-2.5 py-1 rounded-full">
              {t.boardYou(board.me.rank, board.me.best)}
            </span>
          )}
          <button
            type="button"
            onClick={() => loadBoard(true)}
            disabled={loading || refreshing}
            aria-label={t.boardRefresh}
            title={t.boardRefresh}
            className="min-w-[36px] min-h-[36px] rounded-xl border border-[var(--border-subtle)] bg-[#12152a] hover:bg-[#191d38] text-slate-300 hover:text-white flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" aria-label="Loading" />
        </div>
      ) : board?.top.length ? (
        <ol className="space-y-1.5">
          {board.top.map((e) => {
            const isMe = fid !== null && e.fid === fid;
            return (
              <li
                key={e.fid}
                className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs border transition-colors ${
                  isMe
                    ? 'bg-violet-950/45 border-violet-500/50'
                    : 'bg-[#0c0e1d]/80 border-[#1e2242]'
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`tabular-nums w-6 h-6 rounded-lg border text-[11px] font-extrabold flex items-center justify-center shrink-0 ${rankBadgeStyle(
                      e.rank
                    )}`}
                  >
                    {e.rank === 1 ? <Crown className="w-3.5 h-3.5" aria-hidden="true" /> : e.rank}
                  </span>
                  <span className="text-slate-100 font-semibold truncate">
                    {e.username ? `@${e.username}` : `FID #${e.fid}`}
                  </span>
                  {e.username && (
                    <span className="text-[10px] text-slate-400 tabular-nums shrink-0">
                      #{e.fid}
                    </span>
                  )}
                </span>
                <span className="tabular-nums font-extrabold text-sm text-white shrink-0">
                  {e.score.toLocaleString()}
                </span>
              </li>
            );
          })}
        </ol>
      ) : board ? (
        <div className="rounded-xl border border-dashed border-[var(--border-subtle)] bg-[#0b0d1b]/60 py-5 px-3 text-center text-xs text-slate-300">
          {t.boardEmpty}
        </div>
      ) : null}

      {statusText && (
        <p className="text-xs text-slate-300 mt-3 px-1" role="status">
          {statusText}
        </p>
      )}
    </section>
  );
}
