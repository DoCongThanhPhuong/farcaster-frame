import http from 'node:http'

const PORT = process.env.PORT || 3000
const HOST = process.env.HOST_URL || `http://localhost:${PORT}`

function renderFrameHtml({ title, imageText, buttonText, postUrl }) {
  const imageUrl = `${HOST}/image?text=${encodeURIComponent(imageText)}`
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="og:title" content="${title}" />
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${imageUrl}" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:button:1" content="${buttonText}" />
  <meta property="fc:frame:post_url" content="${postUrl}" />
</head>
<body><h1>${title}</h1><p>${imageText}</p></body>
</html>`
}

function renderSvg(text) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="955" height="500" viewBox="0 0 955 500">
    <rect width="100%" height="100%" fill="#1a1a24"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#7C65C1" font-size="44" font-family="sans-serif">${text}</text>
  </svg>`
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)

  // 1. Dynamic SVG image (no external host needed)
  if (url.pathname === '/image') {
    const text = url.searchParams.get('text') || 'Farcaster Frame'
    res.writeHead(200, { 'Content-Type': 'image/svg+xml' })
    return res.end(renderSvg(text))
  }

  // 2. Initial Frame (GET /)
  if (req.method === 'GET' && url.pathname === '/') {
    const html = renderFrameHtml({
      title: 'Lazy Frame',
      imageText: 'Click button to interact',
      buttonText: 'Click me!',
      postUrl: `${HOST}/api/frame`,
    })
    res.writeHead(200, { 'Content-Type': 'text/html' })
    return res.end(html)
  }

  // 3. Frame Action (POST /api/frame)
  if (req.method === 'POST' && url.pathname === '/api/frame') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      let fid = 'Anon'
      try {
        const parsed = JSON.parse(body)
        fid = parsed?.untrustedData?.fid || 'Anon'
      } catch {
        // ponytail: fallback if payload is empty/form-data
      }

      const html = renderFrameHtml({
        title: 'Frame Response',
        imageText: `Hello FID #${fid}! Success.`,
        buttonText: 'Reset',
        postUrl: `${HOST}/`,
      })
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(html)
    })
    return
  }

  res.writeHead(404)
  res.end('Not found')
})

server.listen(PORT, () => {
  console.log(`Frame server running at ${HOST}`)
})
