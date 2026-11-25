import { ImageResponse } from 'next/og';

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          padding: 48,
          background: 'linear-gradient(135deg, #070812 0%, #12142b 55%, #1c1136 100%)',
          color: '#FFFFFF',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 48,
            borderRadius: 32,
            background: '#0f1224',
            border: '2px solid #2c3263',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ display: 'flex', padding: '8px 22px', borderRadius: 20, background: 'rgba(124,58,237,0.28)', color: '#DDD6FE', fontSize: 18, fontWeight: 700 }}>
                FARCASTER
              </div>
              <div style={{ display: 'flex', padding: '8px 22px', borderRadius: 20, background: 'rgba(2,132,199,0.28)', color: '#7DD3FC', fontSize: 18, fontWeight: 700 }}>
                BASE L2
              </div>
              <div style={{ display: 'flex', padding: '8px 22px', borderRadius: 20, background: 'rgba(244,63,94,0.22)', color: '#FDA4AF', fontSize: 18, fontWeight: 700 }}>
                TRAP ARCADE
              </div>
            </div>

            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 24,
                background: '#171b38',
                border: '2px solid #4C1D95',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="56" height="56" viewBox="0 0 24 24">
                <polygon points="13.5,2 5,13.2 10.6,13.2 9.5,22 19,10.4 13.2,10.4" fill="#38BDF8" />
              </svg>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 70, fontWeight: 800, letterSpacing: -1 }}>FarBase Rush</div>
            <div style={{ fontSize: 26, color: '#CBD5E1' }}>
              3 Campaign Worlds • Daily Seeded Challenge • Top 10 Leaderboard
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24 }}>
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: '22px 28px',
                borderRadius: 20,
                background: '#161a35',
                border: '1px solid #2e3568',
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 700, color: '#FBBF24' }}>Daily Global Map (UTC)</div>
              <div style={{ fontSize: 18, color: '#94A3B8' }}>Same traps for everyone • Verified FID ranking</div>
            </div>

            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: '22px 28px',
                borderRadius: 20,
                background: '#161a35',
                border: '1px solid #2e3568',
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 700, color: '#38BDF8' }}>VI • EN • ES • JA</div>
              <div style={{ fontSize: 18, color: '#94A3B8' }}>Hidden blocks, rug-pulls &amp; FUD monsters</div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { 'Cache-Control': 'public, max-age=86400' },
    }
  );
}
