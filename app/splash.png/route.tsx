import { ImageResponse } from 'next/og';

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#070812',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: '#FFFFFF',
        }}
      >
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: 44,
            background: '#11142b',
            border: '3px solid #4C1D95',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
          }}
        >
          <svg width="110" height="110" viewBox="0 0 24 24">
            <polygon points="13.5,2 5,13.2 10.6,13.2 9.5,22 19,10.4 13.2,10.4" fill="#38BDF8" />
          </svg>
        </div>
        <div style={{ fontSize: 38, fontWeight: 800, marginBottom: 10 }}>FARBASE RUSH</div>
        <div style={{ fontSize: 20, color: '#94A3B8' }}>Trap Arcade &amp; Daily Leaderboard</div>
      </div>
    ),
    {
      width: 600,
      height: 600,
      headers: { 'Cache-Control': 'public, max-age=86400' },
    }
  );
}
