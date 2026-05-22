import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
            gap: '0px',
          }}
        >
          <div style={{ fontSize: '52px', lineHeight: 1 }}>⚽</div>
          <div
            style={{
              fontSize: '34px',
              fontWeight: 900,
              color: '#FFD700',
              fontFamily: 'sans-serif',
              letterSpacing: '-1px',
              lineHeight: 1.1,
            }}
          >
            Mundial
          </div>
          <div
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.5)',
              fontFamily: 'sans-serif',
              letterSpacing: '1px',
              lineHeight: 1,
            }}
          >
            2026
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
