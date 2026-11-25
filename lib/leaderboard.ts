import { Redis } from '@upstash/redis';

export interface LeaderboardEntry {
  rank: number;
  fid: number;
  username: string | null;
  score: number;
}

const TOP_N = 10;
// Keep a month of daily boards, then let Redis drop them.
const BOARD_TTL_SECONDS = 30 * 24 * 60 * 60;

// The Vercel Upstash integration sets KV_*; a direct Upstash setup uses UPSTASH_REDIS_REST_*.
const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

export const isLeaderboardConfigured = () => redis !== null;

const boardKey = (day: number) => `farbase:daily:${day}`;
const namesKey = 'farbase:usernames';

/** Records the score if it beats the player's best for that day. Returns the player's best and rank. */
export async function submitDailyScore(day: number, fid: number, score: number, username: string | null) {
  if (!redis) throw new Error('Leaderboard not configured');
  const key = boardKey(day);
  const tx = redis.multi();
  tx.zadd(key, { gt: true }, { score, member: String(fid) });
  tx.expire(key, BOARD_TTL_SECONDS);
  if (username) tx.hset(namesKey, { [fid]: username });
  await tx.exec();
  return getPlayerStanding(day, fid);
}

export async function getPlayerStanding(day: number, fid: number) {
  if (!redis) throw new Error('Leaderboard not configured');
  const key = boardKey(day);
  const [best, rank] = await Promise.all([redis.zscore(key, String(fid)), redis.zrevrank(key, String(fid))]);
  return best === null || rank === null ? null : { best: Number(best), rank: rank + 1 };
}

export async function getDailyTop(day: number): Promise<LeaderboardEntry[]> {
  if (!redis) throw new Error('Leaderboard not configured');
  const flat = await redis.zrange<(string | number)[]>(boardKey(day), 0, TOP_N - 1, { rev: true, withScores: true });
  const rows: { fid: number; score: number }[] = [];
  for (let i = 0; i < flat.length; i += 2) rows.push({ fid: Number(flat[i]), score: Number(flat[i + 1]) });
  if (rows.length === 0) return [];

  const names = (await redis.hmget<Record<string, string>>(namesKey, ...rows.map((r) => String(r.fid)))) ?? {};
  return rows.map((r, i) => ({ rank: i + 1, fid: r.fid, username: names[String(r.fid)] ?? null, score: r.score }));
}
