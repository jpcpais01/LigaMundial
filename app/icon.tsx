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
          background: 'linear-gradient(160deg, #0a1628 0%, #050714 55%, #0d1238 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '22%',
          gap: 0,
        }}
      >
        {/* Top accent line */}
        <div style={{ width: '80px', height: '2px', background: '#FFD700', marginBottom: '18px', borderRadius: '2px' }} />

        {/* LIGA */}
        <div
          style={{
            fontSize: '32px',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.45)',
            fontFamily: 'sans-serif',
            letterSpacing: '14px',
            lineHeight: 1,
            marginBottom: '4px',
          }}
        >
          LIGA
        </div>

        {/* MUNDIAL */}
        <div
          style={{
            fontSize: '96px',
            fontWeight: 900,
            color: '#FFD700',
            fontFamily: 'sans-serif',
            letterSpacing: '-3px',
            lineHeight: 1,
            marginBottom: '4px',
          }}
        >
          MUNDIAL
        </div>

        {/* 26 */}
        <div
          style={{
            fontSize: '52px',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.55)',
            fontFamily: 'sans-serif',
            letterSpacing: '10px',
            lineHeight: 1,
            marginBottom: '18px',
          }}
        >
          26
        </div>

        {/* Bottom accent line */}
        <div style={{ width: '80px', height: '2px', background: '#FFD700', borderRadius: '2px' }} />
      </div>
    ),
    { ...size },
  );
}
