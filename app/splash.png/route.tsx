import { ImageResponse } from 'next/og';

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0d0f12',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: '#f3f4f6',
        }}
      >
        <div
          style={{
            width: 168,
            height: 168,
            borderRadius: 36,
            background: '#0052ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
            position: 'relative',
          }}
        >
          <svg width="98" height="98" viewBox="0 0 24 24">
            <polygon points="13.5,2.5 5.5,13 10.7,13 9.5,21.5 18.5,11 13.2,11" fill="#ffffff" />
          </svg>
          <div
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: 44,
              height: 44,
              borderBottomRightRadius: 36,
              background: '#ff5500',
            }}
          />
        </div>
        <div style={{ fontSize: 38, fontWeight: 800, marginBottom: 8, letterSpacing: -0.5 }}>FARBASE RUSH</div>
        <div style={{ fontSize: 20, color: '#8892a2' }}>Trap Arcade &amp; Daily Leaderboard</div>
      </div>
    ),
    {
      width: 600,
      height: 600,
      headers: { 'Cache-Control': 'public, max-age=86400' },
    }
  );
}
