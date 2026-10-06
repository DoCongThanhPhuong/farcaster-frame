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

export default async function handler(req, res) {
  const proto = req.headers['x-forwarded-proto'] || 'http'
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000'
  const baseUrl = `${proto}://${host}`
  const url = new URL(req.url, baseUrl)

  // 1. Dynamic SVG
  if (url.pathname === '/image') {
    const text = url.searchParams.get('text') || 'Farcaster Frame'
    res.statusCode = 200
    res.setHeader('Content-Type', 'image/svg+xml')
    return res.end(renderSvg(text))
  }

  // 2. Action (POST)
  if (req.method === 'POST') {
    let body = req.body
    if (!body || typeof body === 'string') {
      let raw = ''
      for await (const chunk of req) raw += chunk
      try { body = JSON.parse(raw) } catch {}
    }

    const fid = body?.untrustedData?.fid || 'Anon'
    const html = renderFrameHtml({
      title: 'Frame Response',
      imageText: `Hello FID #${fid}! Success.`,
      buttonText: 'Reset',
      postUrl: `${baseUrl}/`,
      baseUrl,
    })

    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html')
    return res.end(html)
  }

  // 3. Initial Frame (GET /)
  const html = renderFrameHtml({
    title: 'Lazy Frame',
    imageText: 'Click button to interact',
    buttonText: 'Click me!',
    postUrl: `${baseUrl}/api/frame`,
    baseUrl,
  })

  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html')
  return res.end(html)
}
