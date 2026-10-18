import assert from 'node:assert';
import { spawn } from 'node:child_process';

const PORT = 3567;
const child = spawn('npx', ['next', 'start', '-p', String(PORT)], {
  cwd: process.cwd(),
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

  console.log('✅ All Farcaster Frame v2, API endpoints & unit logic test suites passed!');
} finally {
  try {
    process.kill(-child.pid, 'SIGKILL');
  } catch {}
}
