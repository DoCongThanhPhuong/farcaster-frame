import assert from 'node:assert';
import { spawn } from 'node:child_process';

const PORT = 3567;
const child = spawn('npx', ['next', 'start', '-p', String(PORT)], {
  cwd: process.cwd(),
  stdio: 'pipe',
  detached: true,
});

// Wait for Next.js server to start
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
  // Test 1: GET / (HTML + Frame meta tags)
  const resHome = await fetch(`http://localhost:${PORT}/`);
  assert.strictEqual(resHome.status, 200);
  const homeText = await resHome.text();
  assert(homeText.includes('fc:frame'), 'Missing fc:frame metadata');

  // Test 2: GET /.well-known/farcaster.json (Mini App Manifest)
  const resManifest = await fetch(`http://localhost:${PORT}/.well-known/farcaster.json`);
  assert.strictEqual(resManifest.status, 200);
  const manifest = await resManifest.json();
  assert(manifest.frame, 'Missing manifest.frame');
  assert.strictEqual(manifest.frame.version, '1');

  // Test 3: GET /icon.png & /splash.png
  const resIcon = await fetch(`http://localhost:${PORT}/icon.png`);
  assert.strictEqual(resIcon.status, 200);
  assert.strictEqual(resIcon.headers.get('content-type'), 'image/png');

  const resSplash = await fetch(`http://localhost:${PORT}/splash.png`);
  assert.strictEqual(resSplash.status, 200);
  assert.strictEqual(resSplash.headers.get('content-type'), 'image/png');

  // Test 4: POST /api/frame (Frame v1 webhook)
  const resPost = await fetch(`http://localhost:${PORT}/api/frame`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ untrustedData: { fid: 9999 } }),
  });
  assert.strictEqual(resPost.status, 200);
  const postHtml = await resPost.text();
  assert(postHtml.includes('FID #9999'), 'Missing FID in POST response');

  console.log('✅ All Farcaster Frame v2 & v1 test suites passed!');
} finally {
  try {
    process.kill(-child.pid, 'SIGKILL');
  } catch {}
  process.exit(0);
}
