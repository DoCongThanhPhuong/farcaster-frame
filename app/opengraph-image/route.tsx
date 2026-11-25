import { ImageResponse } from 'next/og';

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          padding: 44,
          background: '#0d0f12',
          color: '#f3f4f6',
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
            borderRadius: 24,
            background: '#15181d',
            border: '2px solid #262b34',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ display: 'flex', padding: '8px 18px', borderRadius: 8, background: '#0052ff', color: '#ffffff', fontSize: 17, fontWeight: 700 }}>
                BASE L2
              </div>
              <div style={{ display: 'flex', padding: '8px 18px', borderRadius: 8, background: '#ff5500', color: '#ffffff', fontSize: 17, fontWeight: 700 }}>
                TRAP ARCADE
              </div>
              <div style={{ display: 'flex', padding: '8px 18px', borderRadius: 8, background: '#1d2128', border: '1px solid #363d4a', color: '#b4bcc8', fontSize: 17, fontWeight: 700 }}>
                VI • EN • ES • JA
              </div>
            </div>

            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: 18,
                background: '#0052ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24">
                <polygon points="13.5,2.5 5.5,13 10.7,13 9.5,21.5 18.5,11 13.2,11" fill="#ffffff" />
              </svg>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -1.5 }}>FARBASE RUSH</div>
            <div style={{ fontSize: 26, color: '#b4bcc8' }}>
              3 Campaign Worlds • Daily Seeded Challenge • Verified FID Leaderboard
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20 }}>
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                padding: '22px 26px',
                borderRadius: 14,
                background: '#0d0f12',
                border: '1px solid #262b34',
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 700, color: '#f59e0b' }}>Daily Global Map (UTC)</div>
              <div style={{ fontSize: 17, color: '#8892a2' }}>Identical traps for every player • Top 10 daily ranking</div>
            </div>

            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                padding: '22px 26px',
                borderRadius: 14,
                background: '#0d0f12',
                border: '1px solid #262b34',
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 700, color: '#ff5500' }}>Tactile Precision Platformer</div>
              <div style={{ fontSize: 17, color: '#8892a2' }}>Dodge hidden blocks, rug-pulls &amp; patrolling FUD bots</div>
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
