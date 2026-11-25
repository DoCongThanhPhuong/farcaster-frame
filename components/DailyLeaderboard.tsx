'use client';

import { useCallback, useEffect, useState } from 'react';
import { Trophy, RefreshCw, Crown } from 'lucide-react';
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
    if (rank === 1) return 'bg-gold/15 text-gold border-gold/40';
    if (rank === 2) return 'bg-ink/10 text-ink border-line-strong';
    if (rank === 3) return 'bg-signal/15 text-signal border-signal/40';
    return 'bg-canvas text-ink-muted border-line';
  };

  return (
    <section
      className="bg-surface border border-line rounded-xl p-4"
      aria-labelledby="daily-board-title"
    >
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-line">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg bg-elevated border border-line-strong flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <Trophy className="w-4 h-4 text-gold" />
          </div>
          <div className="min-w-0">
            <h2 id="daily-board-title" className="font-bold text-ink text-sm truncate">
              {t.boardTitle(day)}
            </h2>
            <p className="text-xs text-ink-muted truncate">{t.boardSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {board?.me && (
            <span className="tabular-nums text-xs font-semibold text-gold bg-gold/10 border border-gold/30 px-2 py-1 rounded-md">
              {t.boardYou(board.me.rank, board.me.best)}
            </span>
          )}
          <button
            type="button"
            onClick={() => loadBoard(true)}
            disabled={loading || refreshing}
            aria-label={t.boardRefresh}
            title={t.boardRefresh}
            className="w-8 h-8 rounded-lg border border-line bg-elevated hover:bg-elevated-hover text-ink-secondary hover:text-ink flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-1.5" role="status" aria-busy="true" aria-label={t.boardTitle(day)}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-9 rounded-lg bg-elevated animate-pulse border border-line/60"
            />
          ))}
        </div>
      ) : board?.top.length ? (
        <ol className="space-y-1.5">
          {board.top.map((e) => {
            const isMe = fid !== null && e.fid === fid;
            return (
              <li
                key={e.fid}
                className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs border transition-colors ${
                  isMe
                    ? 'bg-brand/10 border-brand-bright/50'
                    : 'bg-canvas border-line'
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className={`tabular-nums w-6 h-6 rounded-md border text-[11px] font-bold flex items-center justify-center shrink-0 ${rankBadgeStyle(
                      e.rank
                    )}`}
                  >
                    {e.rank === 1 ? <Crown className="w-3.5 h-3.5" aria-hidden="true" /> : e.rank}
                  </span>
                  <span className="text-ink font-medium truncate">
                    {e.username ? `@${e.username}` : `FID #${e.fid}`}
                  </span>
                  {e.username && (
                    <span className="text-[11px] text-ink-muted tabular-nums shrink-0">
                      #{e.fid}
                    </span>
                  )}
                </span>
                <span className="tabular-nums font-bold text-sm text-ink shrink-0">
                  {e.score.toLocaleString()}
                </span>
              </li>
            );
          })}
        </ol>
      ) : board ? (
        <div className="rounded-lg border border-dashed border-line-strong bg-canvas py-6 px-3 text-center text-xs text-ink-secondary">
          {t.boardEmpty}
        </div>
      ) : null}

      {statusText && (
        <p className="text-xs text-ink-secondary mt-3" role="status">
          {statusText}
        </p>
      )}
    </section>
  );
}
