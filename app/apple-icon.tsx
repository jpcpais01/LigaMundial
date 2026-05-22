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
          background: 'linear-gradient(160deg, #0a1628 0%, #050714 55%, #0d1238 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '22%',
          gap: 0,
        }}
      >
        <div style={{ width: '28px', height: '2px', background: '#FFD700', marginBottom: '6px', borderRadius: '2px' }} />

        <div
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.45)',
            fontFamily: 'sans-serif',
            letterSpacing: '5px',
            lineHeight: 1,
            marginBottom: '2px',
          }}
        >
          LIGA
        </div>

        <div
          style={{
            fontSize: '34px',
            fontWeight: 900,
            color: '#FFD700',
            fontFamily: 'sans-serif',
            letterSpacing: '-1px',
            lineHeight: 1,
            marginBottom: '2px',
          }}
        >
          MUNDIAL
        </div>

        <div
          style={{
            fontSize: '19px',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.55)',
            fontFamily: 'sans-serif',
            letterSpacing: '4px',
            lineHeight: 1,
            marginBottom: '6px',
          }}
        >
          26
        </div>

        <div style={{ width: '28px', height: '2px', background: '#FFD700', borderRadius: '2px' }} />
      </div>
    ),
    { ...size },
  );
}
