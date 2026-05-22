import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #050714 0%, #0d1b3e 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '22%',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}
        >
          <div style={{ fontSize: '200px', lineHeight: 1 }}>⚽</div>
          <div
            style={{
              fontSize: '100px',
              fontWeight: 900,
              color: '#FFD700',
              fontFamily: 'sans-serif',
              letterSpacing: '-4px',
              lineHeight: 1,
            }}
          >
            LM
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
