import assert from 'node:assert';
import { spawn } from 'node:child_process';

const PORT = 3567;
const child = spawn('npx', ['next', 'start', '-p', String(PORT)], {
  cwd: process.cwd(),
  // No Redis in tests: the leaderboard must degrade to 503 instead of crashing.
  env: { ...process.env, UPSTASH_REDIS_REST_URL: '', UPSTASH_REDIS_REST_TOKEN: '', KV_REST_API_URL: '', KV_REST_API_TOKEN: '' },
  stdio: 'pipe',
  detached: true,
});

let started = false;
for (let i = 0; i < 30; i++) {
  try {
    const res = await fetch(`http://localhost:${PORT}/`);
    if (res.status === 200) {
      started = true;
      break;
    }
  } catch {}
  await new Promise((r) => setTimeout(r, 400));
}

assert(started, 'Server failed to start within timeout');

try {
  const resHome = await fetch(`http://localhost:${PORT}/`);
  assert.strictEqual(resHome.status, 200);
  const homeText = await resHome.text();
  assert(homeText.includes('fc:frame'), 'Missing fc:frame metadata');

  const resManifest = await fetch(`http://localhost:${PORT}/.well-known/farcaster.json`);
  assert.strictEqual(resManifest.status, 200);
  const manifest = await resManifest.json();
  assert(manifest.frame, 'Missing manifest.frame');
  assert.strictEqual(manifest.frame.version, '1');

  const resIcon = await fetch(`http://localhost:${PORT}/icon.png`);
  assert.strictEqual(resIcon.status, 200);
  assert.strictEqual(resIcon.headers.get('content-type'), 'image/png');

  const resSplash = await fetch(`http://localhost:${PORT}/splash.png`);
  assert.strictEqual(resSplash.status, 200);
  assert.strictEqual(resSplash.headers.get('content-type'), 'image/png');

  const resFavicon = await fetch(`http://localhost:${PORT}/favicon.ico`, { redirect: 'manual' });
  assert(resFavicon.status === 200 || resFavicon.status === 307 || resFavicon.status === 308, 'Favicon failed');
  const resPost = await fetch(`http://localhost:${PORT}/api/frame`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ untrustedData: { fid: 9999 } }),
  });
  assert.strictEqual(resPost.status, 200);
  const postHtml = await resPost.text();
  assert(postHtml.includes('FID #9999'), 'Missing FID in POST response');

  const resSigBad = await fetch(`http://localhost:${PORT}/api/verify-signature`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: 'invalid', message: 'test', signature: '0x0' }),
  });
  assert.strictEqual(resSigBad.status, 400);

  const resBoard = await fetch(`http://localhost:${PORT}/api/leaderboard`);
  assert.strictEqual(resBoard.status, 503, 'Unconfigured leaderboard must answer 503');
  assert.strictEqual((await resBoard.json()).configured, false);
  for (const day of ['0', '-1', '1.5', 'abc', '999999']) {
    const res = await fetch(`http://localhost:${PORT}/api/leaderboard?day=${day}`);
    assert.strictEqual(res.status, 400, `day=${day} should be rejected`);
  }
  const postScore = (headers) =>
    fetch(`http://localhost:${PORT}/api/leaderboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ day: 1, score: 100 }),
    });
  assert.strictEqual((await postScore({})).status, 401, 'Score submit without token must be 401');
  for (const token of ['garbage', 'a.b.c', 'eyJhbGciOiJFUzI1NiJ9.eyJzdWIiOjF9.c2ln']) {
    assert.strictEqual((await postScore({ Authorization: `Bearer ${token}` })).status, 401, `Forged token ${token} must be 401`);
  }

  function calculatePoints(fid, isWallet, streak, hasPass, gameScore) {
    let fidPoints = fid ? 1200 : 0;
    if (fid && fid < 10000) fidPoints = 8500;
    else if (fid && fid < 50000) fidPoints = 4800;
    else if (fid && fid < 200000) fidPoints = 2600;

    let mult = 1.0;
    if (isWallet) mult += 0.3;
    if (streak > 0) mult += streak * 0.15;
    if (hasPass) mult += 0.5;
    if (gameScore >= 100) mult += 0.2;

    return Math.round(fidPoints * mult);
  }

  assert.strictEqual(calculatePoints(500, false, 0, false, 0), 8500);
  assert.strictEqual(calculatePoints(25000, true, 2, true, 120), Math.round(4800 * (1.0 + 0.3 + 0.3 + 0.5 + 0.2)));

  function computeNextStreak(lastCheckinTime, currentStreak, now) {
    const diffMs = now - lastCheckinTime;
    const cooldown = 24 * 60 * 60 * 1000;
    const expired = diffMs > 48 * 60 * 60 * 1000;
    if (diffMs < cooldown && lastCheckinTime > 0) return { canClaim: false, nextStreak: currentStreak };
    if (expired) return { canClaim: true, nextStreak: 1 };
    return { canClaim: true, nextStreak: currentStreak + 1 };
  }

  const now = Date.now();
  assert.strictEqual(computeNextStreak(now - 1000 * 60 * 60 * 2, 3, now).canClaim, false);
  assert.strictEqual(computeNextStreak(now - 1000 * 60 * 60 * 25, 3, now).nextStreak, 4);
  assert.strictEqual(computeNextStreak(now - 1000 * 60 * 60 * 50, 3, now).nextStreak, 1);

  // Level layout sanity: physics gives ~140px of horizontal jump reach, so keep every hop under 100px.
  const { LEVELS, dailyLevel, dailyNumber, maxScore, POINTS } = await import('./lib/levels.ts');
  // Genesis Block: 6 base + 6 farcaster coins, 6 ? blocks, 6 enemies, flag.
  assert.strictEqual(maxScore(LEVELS[0]), 6 * POINTS.base + 6 * POINTS.farcaster + 6 * POINTS.question + 6 * POINTS.stomp + POINTS.flag);
  assert.strictEqual(maxScore(LEVELS[0]), 1700);
  const MAX_HOP = 100;
  const checkLevel = (lv) => {
    const grounds = lv.platforms.filter((p) => p.type === 'ground').sort((a, b) => a.x - b.x);
    const onGround = (x, w = 20) => grounds.some((g) => x >= g.x && x + w <= g.x + g.w);
    const groundAt = (x) => grounds.findIndex((g) => x >= g.x && x <= g.x + g.w);

    for (let i = 1; i < grounds.length; i++) {
      const from = grounds[i - 1].x + grounds[i - 1].w;
      const to = grounds[i].x;
      if (to - from <= MAX_HOP) continue;
      const bridges = lv.platforms.filter((p) => p.type === 'rugpull' && p.x >= from && p.x + p.w <= to);
      assert(bridges.length > 0, `${lv.name}: gap ${from}-${to} is unjumpable with no bridge`);
      let edge = from;
      for (const b of bridges.sort((a, c) => a.x - c.x)) {
        assert(b.x - edge <= MAX_HOP, `${lv.name}: hop onto bridge at ${b.x} too long`);
        edge = b.x + b.w;
      }
      assert(to - edge <= MAX_HOP, `${lv.name}: hop off bridge to ${to} too long`);
    }

    for (const cp of lv.checkpoints) {
      assert(onGround(cp), `${lv.name}: checkpoint ${cp} not on ground`);
      // Respawn drops in from y=150, so landing on a pipe is fine; landing on a collapsing column is not.
      const blocked = lv.platforms.some((p) => p.type === 'hollow_column' && cp < p.x + p.w && cp + 20 > p.x);
      assert(!blocked, `${lv.name}: checkpoint ${cp} respawns onto a hollow column`);
    }
    for (const e of lv.enemies) {
      const seg = groundAt(e.rangeStart);
      assert(seg >= 0 && seg === groundAt(e.rangeEnd + 20), `${lv.name}: enemy range ${e.rangeStart}-${e.rangeEnd} crosses a pit`);
      assert(e.x >= e.rangeStart && e.x <= e.rangeEnd, `${lv.name}: enemy at ${e.x} outside its range`);
    }
    const flagSpots = [lv.flagX, ...lv.fleeTo];
    flagSpots.forEach((x, i) => {
      assert(onGround(x, 8) && x < lv.width, `${lv.name}: flag spot ${x} not on ground`);
      if (i > 0) assert(x > flagSpots[i - 1], `${lv.name}: flag must flee forward`);
    });
    assert(flagSpots.at(-1) < lv.width, `${lv.name}: flag beyond level width`);
  };
  LEVELS.forEach(checkLevel);
  for (let day = 1; day <= 500; day++) checkLevel(dailyLevel(day));
  assert.deepStrictEqual(dailyLevel(42), dailyLevel(42), 'Daily level must be deterministic');
  assert.notDeepStrictEqual(dailyLevel(42), dailyLevel(43), 'Consecutive days should differ');
  assert.strictEqual(dailyNumber(Date.UTC(2026, 9, 26, 23, 59)), 1);
  assert.strictEqual(dailyNumber(Date.UTC(2026, 9, 27, 0, 1)), 2);

  // Leaderboard storage against a minimal in-memory Upstash REST server (just the commands lib/leaderboard.ts uses).
  const zsets = new Map();
  const hashes = new Map();
  const run = ([cmd, key, ...a]) => {
    const z = zsets.get(key) ?? new Map();
    const desc = () => [...z].sort((x, y) => y[1] - x[1]);
    switch (cmd.toLowerCase()) {
      case 'zadd': {
        const gt = String(a[0]).toLowerCase() === 'gt';
        const [score, member] = gt ? a.slice(1) : a;
        if (!gt || !z.has(member) || Number(score) > z.get(member)) z.set(member, Number(score));
        zsets.set(key, z);
        return 1;
      }
      case 'expire': return 1;
      case 'hset': {
        const h = hashes.get(key) ?? new Map();
        for (let i = 0; i < a.length; i += 2) h.set(String(a[i]), a[i + 1]);
        hashes.set(key, h);
        return 1;
      }
      case 'hmget': return a.map((f) => hashes.get(key)?.get(String(f)) ?? null);
      case 'zscore': return z.has(a[0]) ? String(z.get(a[0])) : null;
      case 'zrevrank': { const i = desc().findIndex(([m]) => m === a[0]); return i < 0 ? null : i; }
      case 'zrange': return desc().slice(Number(a[0]), Number(a[1]) + 1).flatMap(([m, s]) => [m, String(s)]);
      default: throw new Error(`fake redis: unsupported ${cmd}`);
    }
  };
  // When the client asks for base64 responses it decodes every string it gets back.
  const b64 = (v) => (typeof v === 'string' ? Buffer.from(v).toString('base64') : Array.isArray(v) ? v.map(b64) : v);
  const { createServer } = await import('node:http');
  const fakeRedis = createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      const cmds = JSON.parse(body);
      const enc = req.headers['upstash-encoding'] === 'base64' ? b64 : (v) => v;
      const out = req.url === '/' ? { result: enc(run(cmds)) } : cmds.map((c) => ({ result: enc(run(c)) }));
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(out));
    });
  });
  await new Promise((r) => fakeRedis.listen(0, r));
  process.env.UPSTASH_REDIS_REST_URL = `http://127.0.0.1:${fakeRedis.address().port}`;
  process.env.UPSTASH_REDIS_REST_TOKEN = 'test';
  try {
    const lb = await import('./lib/leaderboard.ts');
    assert(lb.isLeaderboardConfigured());
    await lb.submitDailyScore(7, 111, 300, 'alice');
    assert.deepStrictEqual(await lb.submitDailyScore(7, 111, 100, 'alice'), { best: 300, rank: 1 }, 'A lower score must not overwrite the best');
    assert.deepStrictEqual(await lb.submitDailyScore(7, 222, 500, null), { best: 500, rank: 1 });
    assert.deepStrictEqual(await lb.getPlayerStanding(7, 111), { best: 300, rank: 2 });
    assert.strictEqual(await lb.getPlayerStanding(7, 333), null);
    assert.deepStrictEqual(await lb.getDailyTop(7), [
      { rank: 1, fid: 222, username: null, score: 500 },
      { rank: 2, fid: 111, username: 'alice', score: 300 },
    ]);
    assert.deepStrictEqual(await lb.getDailyTop(8), []);
  } finally {
    fakeRedis.close();
  }

  console.log('✅ All Farcaster Frame v2, API endpoints & unit logic test suites passed!');
} finally {
  try {
    process.kill(-child.pid, 'SIGKILL');
  } catch {}
}
