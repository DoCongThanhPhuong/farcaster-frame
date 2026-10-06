import assert from 'node:assert'
import { spawn } from 'node:child_process'

const child = spawn('node', ['server.mjs'], {
  cwd: '/home/phuongdct/.gemini/antigravity/scratch/farcaster-frame',
  env: { ...process.env, PORT: '3456' },
})

await new Promise(r => setTimeout(r, 500))

try {
  // Test 1: GET initial frame
  const resGet = await fetch('http://localhost:3456/')
  assert.strictEqual(resGet.status, 200)
  const htmlGet = await resGet.text()
  assert(htmlGet.includes('fc:frame'))
  assert(htmlGet.includes('fc:frame:button:1'))

  // Test 2: GET dynamic SVG
  const resSvg = await fetch('http://localhost:3456/image?text=Test')
  assert.strictEqual(resSvg.status, 200)
  assert.strictEqual(resSvg.headers.get('content-type'), 'image/svg+xml')
  const svgText = await resSvg.text()
  assert(svgText.includes('Test'))

  // Test 3: POST interaction
  const resPost = await fetch('http://localhost:3456/api/frame', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ untrustedData: { fid: 1234 } }),
  })
  assert.strictEqual(resPost.status, 200)
  const htmlPost = await resPost.text()
  assert(htmlPost.includes('Hello FID #1234'))

  console.log('All checks passed.')
} finally {
  child.kill()
}
