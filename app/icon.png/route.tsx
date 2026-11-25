import { ImageResponse } from 'next/og';

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 56,
          background: '#0052ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <svg width="150" height="150" viewBox="0 0 24 24">
          <polygon points="13.5,2.5 5.5,13 10.7,13 9.5,21.5 18.5,11 13.2,11" fill="#ffffff" />
        </svg>
        <div
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: 72,
            height: 72,
            borderBottomRightRadius: 56,
            background: '#ff5500',
          }}
        />
      </div>
    ),
    {
      width: 256,
      height: 256,
      headers: { 'Cache-Control': 'public, max-age=86400' },
    }
  );
}
