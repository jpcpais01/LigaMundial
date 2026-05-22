import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const size = parseInt(req.nextUrl.searchParams.get('size') || '512');

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: '#060810',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: `${size * 0.22}px`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gold radial glow behind text */}
        <div
          style={{
            position: 'absolute',
            width: size * 0.7,
            height: size * 0.7,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,215,0,0.07) 0%, transparent 70%)',
            top: '15%',
            left: '15%',
          }}
        />

        {/* Gold ring */}
        <div
          style={{
            position: 'absolute',
            width: size * 0.78,
            height: size * 0.78,
            borderRadius: '50%',
            border: `${size * 0.006}px solid rgba(255,215,0,0.18)`,
            top: size * 0.11,
            left: size * 0.11,
          }}
        />

        {/* LIGA */}
        <div
          style={{
            fontSize: size * 0.075,
            fontWeight: 400,
            color: 'rgba(255,215,0,0.7)',
            fontFamily: 'sans-serif',
            letterSpacing: `${size * 0.028}px`,
            lineHeight: 1,
            marginBottom: `${size * 0.01}px`,
          }}
        >
          LIGA
        </div>

        {/* Top separator */}
        <div
          style={{
            width: size * 0.2,
            height: 1.5,
            background: 'rgba(255,215,0,0.35)',
            marginBottom: `${size * 0.03}px`,
          }}
        />

        {/* 26 — hero element */}
        <div
          style={{
            fontSize: size * 0.42,
            fontWeight: 900,
            color: '#FFFFFF',
            fontFamily: 'sans-serif',
            letterSpacing: `${size * -0.015}px`,
            lineHeight: 0.88,
          }}
        >
          26
        </div>

        {/* Bottom separator */}
        <div
          style={{
            width: size * 0.2,
            height: 1.5,
            background: 'rgba(255,215,0,0.35)',
            marginTop: `${size * 0.03}px`,
            marginBottom: `${size * 0.01}px`,
          }}
        />

        {/* MUNDIAL */}
        <div
          style={{
            fontSize: size * 0.072,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.45)',
            fontFamily: 'sans-serif',
            letterSpacing: `${size * 0.018}px`,
            lineHeight: 1,
          }}
        >
          MUNDIAL
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
