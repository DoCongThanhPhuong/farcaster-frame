import { ImageResponse } from 'next/og';

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          padding: 10,
          borderRadius: 60,
          background: 'linear-gradient(135deg, #38BDF8 0%, #7C3AED 50%, #F43F5E 100%)',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 52,
            background: '#0b0d1d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="160" height="160" viewBox="0 0 24 24">
            <polygon points="13.5,2 5,13.2 10.6,13.2 9.5,22 19,10.4 13.2,10.4" fill="#A78BFA" />
          </svg>
        </div>
      </div>
    ),
    {
      width: 256,
      height: 256,
      headers: { 'Cache-Control': 'public, max-age=86400' },
    }
  );
}
