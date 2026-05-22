import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  const s = 512;
  return new ImageResponse(
    (
      <div
        style={{
          width: s,
          height: s,
          background: '#060810',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: `${s * 0.22}px`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: s * 0.78,
            height: s * 0.78,
            borderRadius: '50%',
            border: `${s * 0.006}px solid rgba(255,215,0,0.18)`,
            top: s * 0.11,
            left: s * 0.11,
          }}
        />
        <div
          style={{
            fontSize: s * 0.075,
            fontWeight: 400,
            color: 'rgba(255,215,0,0.7)',
            fontFamily: 'sans-serif',
            letterSpacing: `${s * 0.028}px`,
            lineHeight: 1,
            marginBottom: `${s * 0.01}px`,
          }}
        >
          LIGA
        </div>
        <div style={{ width: s * 0.2, height: 1.5, background: 'rgba(255,215,0,0.35)', marginBottom: `${s * 0.03}px` }} />
        <div
          style={{
            fontSize: s * 0.42,
            fontWeight: 900,
            color: '#FFFFFF',
            fontFamily: 'sans-serif',
            letterSpacing: `${s * -0.015}px`,
            lineHeight: 0.88,
          }}
        >
          26
        </div>
        <div style={{ width: s * 0.2, height: 1.5, background: 'rgba(255,215,0,0.35)', marginTop: `${s * 0.03}px`, marginBottom: `${s * 0.01}px` }} />
        <div
          style={{
            fontSize: s * 0.072,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.45)',
            fontFamily: 'sans-serif',
            letterSpacing: `${s * 0.018}px`,
            lineHeight: 1,
          }}
        >
          MUNDIAL
        </div>
      </div>
    ),
    { ...size },
  );
}
