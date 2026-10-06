import http from 'node:http'

const PORT = process.env.PORT || 3000

function renderFrameHtml({ title, imageText, buttonText, postUrl, baseUrl }) {
  const imageUrl = `${baseUrl}/image?text=${encodeURIComponent(imageText)}`
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

const server = http.createServer((req, res) => {
  const proto = req.headers['x-forwarded-proto'] || 'http'
  const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${PORT}`
  const baseUrl = `${proto}://${host}`
  const url = new URL(req.url, baseUrl)

  // 1. Dynamic SVG
  if (url.pathname === '/image') {
    const text = url.searchParams.get('text') || 'Farcaster Frame'
    res.writeHead(200, { 'Content-Type': 'image/svg+xml' })
    return res.end(renderSvg(text))
  }

  // 2. Action (POST)
  if (req.method === 'POST') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      let fid = 'Anon'
      try {
        fid = JSON.parse(body)?.untrustedData?.fid || 'Anon'
      } catch {}

      const html = renderFrameHtml({
        title: 'Frame Response',
        imageText: `Hello FID #${fid}! Success.`,
        buttonText: 'Reset',
        postUrl: `${baseUrl}/`,
        baseUrl,
      })
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(html)
    })
    return
  }

  // 3. Initial Frame (GET /)
  if (req.method === 'GET') {
    const html = renderFrameHtml({
      title: 'Lazy Frame',
      imageText: 'Click button to interact',
      buttonText: 'Click me!',
      postUrl: `${baseUrl}/api/frame`,
      baseUrl,
    })
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    return res.end(html)
  }

  res.writeHead(404).end('Not found')
})

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
