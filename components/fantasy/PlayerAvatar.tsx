'use client';
import { useState } from 'react';
import { getTeam } from '@/data/teams';
import type { FantasyPlayer } from '@/types';

// Foto real do jogador com fallback elegante (iniciais + cor por posição)
const POSITION_COLORS: Record<string, string> = {
  GK: '#f59e0b',
  DEF: '#3b82f6',
  MID: '#10b981',
  FWD: '#f43f5e',
};

export default function PlayerAvatar({
  player, size = 44, className = '',
}: {
  player: FantasyPlayer;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showPhoto = player.photo && !failed;
  const color = POSITION_COLORS[player.position] ?? '#6366f1';
  const initials = player.name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={`relative rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        background: showPhoto
          ? 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))'
          : `linear-gradient(135deg, ${color}33, ${color}14)`,
        border: '1px solid rgba(255,255,255,0.10)',
      }}
    >
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={player.photo!}
          alt={player.name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="w-full h-full object-cover object-top"
        />
      ) : (
        <span className="font-bold text-white/70" style={{ fontSize: size * 0.32 }}>
          {initials}
        </span>
      )}
    </div>
  );
}

export function PlayerFlag({ teamId, className = '' }: { teamId: string; className?: string }) {
  return <span className={className}>{getTeam(teamId).flag}</span>;
}
