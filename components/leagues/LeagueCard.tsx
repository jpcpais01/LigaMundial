'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Users, Check } from 'lucide-react';
import Link from 'next/link';
import type { League } from '@/types';

interface LeagueCardProps {
  league: League;
  memberCount: number;
  isJoined: boolean;
  index: number;
  backgroundUrl?: string;
}

// Visual identity per league
const VISUALS: Record<string, {
  bg: string;
  accent: string;
  label: string;
  pattern: string;
}> = {
  'fase-grupos': {
    bg: 'linear-gradient(135deg, #0c1a3a 0%, #0a1020 100%)',
    accent: '#3b82f6',
    label: 'Geral',
    pattern: `repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(255,255,255,0.03) 31px, rgba(255,255,255,0.03) 32px),
              repeating-linear-gradient(90deg, transparent, transparent 31px, rgba(255,255,255,0.03) 31px, rgba(255,255,255,0.03) 32px)`,
  },
  'fase-copa': {
    bg: 'linear-gradient(135deg, #1a0c3a 0%, #100a20 100%)',
    accent: '#a78bfa',
    label: 'Geral',
    pattern: `repeating-linear-gradient(-45deg, transparent, transparent 14px, rgba(255,255,255,0.025) 14px, rgba(255,255,255,0.025) 15px)`,
  },
  'extra-jornadas': {
    bg: 'linear-gradient(135deg, #0c2e1a 0%, #081a0e 100%)',
    accent: '#34d399',
    label: 'Extra',
    pattern: `radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)`,
  },
  'extra-campeao': {
    bg: 'linear-gradient(135deg, #2e1e06 0%, #1a1004 100%)',
    accent: '#fbbf24',
    label: 'Extra',
    pattern: `repeating-conic-gradient(rgba(251,191,36,0.04) 0deg 10deg, transparent 10deg 20deg)`,
  },
  'extra-marcador': {
    bg: 'linear-gradient(135deg, #2e0c14 0%, #1a060c 100%)',
    accent: '#fb7185',
    label: 'Extra',
    pattern: `repeating-linear-gradient(0deg, transparent, transparent 9px, rgba(255,255,255,0.03) 9px, rgba(255,255,255,0.03) 10px),
              repeating-linear-gradient(90deg, transparent, transparent 9px, rgba(255,255,255,0.03) 9px, rgba(255,255,255,0.03) 10px)`,
  },
};

export default function LeagueCard({ league, memberCount, isJoined, index, backgroundUrl }: LeagueCardProps) {
  const v = VISUALS[league.id] || VISUALS['fase-grupos'];
  const prizes = league.prizeDistribution;
  // Static file takes priority over Firestore upload
  const staticBg = `/leagues/${league.id}/bg.jpg`;
  const [useFallback, setUseFallback] = useState(false);
  const resolvedBg = !useFallback ? staticBg : (backgroundUrl ?? null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link href={`/ligas/${league.id}`}>
        <div
          className="relative rounded-2xl overflow-hidden border border-white/6 active:scale-[0.98] transition-transform duration-150"
          style={{ background: v.bg }}
        >
          {/* Background image — static file or Firestore upload */}
          {resolvedBg && (
            <img
              src={resolvedBg}
              alt=""
              aria-hidden
              onError={() => setUseFallback(true)}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{ opacity: 0.18 }}
            />
          )}

          {/* Pattern overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: v.pattern,
              backgroundSize: league.id === 'extra-jornadas' ? '20px 20px' : undefined,
            }}
          />

          {/* Top accent bar */}
          <div
            className="absolute top-0 inset-x-0 h-[2px]"
            style={{ background: `linear-gradient(90deg, transparent, ${v.accent}80, transparent)` }}
          />

          {/* Right glow */}
          <div
            className="absolute right-0 top-0 bottom-0 w-32 pointer-events-none"
            style={{ background: `linear-gradient(270deg, ${v.accent}10, transparent)` }}
          />

          <div className="relative p-5">
            {/* Name row */}
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                <h3 className="text-white font-bold text-base tracking-tight leading-snug truncate">
                  {league.name}
                </h3>
                {isJoined && (
                  <span className="flex items-center gap-1 text-[9px] font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2 py-0.5 flex-shrink-0">
                    <Check size={8} strokeWidth={2.5} />
                    inscrito
                  </span>
                )}
              </div>
              <ChevronRight size={16} className="text-white/20 flex-shrink-0" />
            </div>
            <p className="text-white/40 text-xs font-medium mb-4">{league.subtitle}</p>

            {/* Bottom stats row */}
            <div className="flex items-center justify-between pt-3.5 border-t border-white/5">
              <div className="flex items-center gap-1.5 text-white/30 text-xs">
                <Users size={11} />
                <span>{memberCount} jogadores</span>
              </div>

              <div className="flex items-center gap-4">
                {prizes.second ? (
                  <span className="text-[11px] flex items-center gap-0.5">
                    <span style={{ color: '#FFD700' }} className="font-semibold">{prizes.first}%</span>
                    <span className="text-white/20 mx-0.5">/</span>
                    <span style={{ color: '#C0C0C0' }} className="font-semibold">{prizes.second}%</span>
                    <span className="text-white/20 mx-0.5">/</span>
                    <span style={{ color: '#CD7F32' }} className="font-semibold">{prizes.third}%</span>
                  </span>
                ) : (
                  <span className="text-white/25 text-[11px]">100% vencedor</span>
                )}
                <div
                  className="text-xs font-bold px-2.5 py-1 rounded-xl"
                  style={{ color: v.accent, backgroundColor: `${v.accent}15` }}
                >
                  {league.entryFee}€
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
