import { NextResponse } from 'next/server';
import { createClient } from '@farcaster/quick-auth';
import { dailyLevel, dailyNumber, maxScore } from '@/lib/levels';
import { getDailyTop, getPlayerStanding, isLeaderboardConfigured, submitDailyScore } from '@/lib/leaderboard';
import { resolveBaseUrl } from '@/lib/url';

const quickAuth = createClient();
const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{0,31}$/i;
const SUBMIT_GRACE_MS = 10 * 60 * 1000;

const notConfigured = () =>
  NextResponse.json({ configured: false, error: 'Leaderboard is not configured' }, { status: 503 });

// The Quick Auth token is bound to the mini app's domain, so verify against the same host the manifest advertises.
const appDomain = (req: Request) => new URL(resolveBaseUrl(req.headers)).host;

async function authenticatedFid(req: Request): Promise<number | null> {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  // Bad tokens surface as assorted jose errors (malformed, wrong key, expired), so any failure means unauthenticated.
  try {
    const payload = await quickAuth.verifyJwt({ token: auth.slice(7), domain: appDomain(req) });
    return payload.sub;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const today = dailyNumber();
  const dayParam = new URL(req.url).searchParams.get('day');
  const day = dayParam === null ? today : Number(dayParam);
  if (!Number.isInteger(day) || day < 1 || day > today) {
    return NextResponse.json({ error: 'Invalid day' }, { status: 400 });
  }
  if (!isLeaderboardConfigured()) return notConfigured();

  const fid = await authenticatedFid(req);
  const [top, me] = await Promise.all([getDailyTop(day), fid ? getPlayerStanding(day, fid) : null]);
  return NextResponse.json({ configured: true, day, top, me }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: Request) {
  const fid = await authenticatedFid(req);
  if (!fid) return NextResponse.json({ error: 'Sign in with Farcaster to submit scores' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const day = body?.day;
  const score = body?.score;
  const username = typeof body?.username === 'string' && USERNAME_RE.test(body.username) ? body.username : null;

  if (!Number.isInteger(day) || !Number.isInteger(score)) {
    return NextResponse.json({ error: 'day and score must be integers' }, { status: 400 });
  }
  // A run started just before UTC midnight still counts for its own day if it ends within the grace window.
  const now = Date.now();
  if (day !== dailyNumber(now) && day !== dailyNumber(now - SUBMIT_GRACE_MS)) {
    return NextResponse.json({ error: 'That daily challenge has ended' }, { status: 409 });
  }
  // The server rebuilds the level, so a score above what it can award is rejected outright.
  // shortcut: the client still reports its own score, so anyone with a token can post the max; verify runs server-side before attaching prizes.
  if (score < 0 || score > maxScore(dailyLevel(day))) {
    return NextResponse.json({ error: 'Score is not possible on this level' }, { status: 400 });
  }
  if (!isLeaderboardConfigured()) return notConfigured();

  const me = await submitDailyScore(day, fid, score, username);
  const top = await getDailyTop(day);
  return NextResponse.json({ configured: true, day, top, me });
}
