'use client';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import PlayerAvatar from './PlayerAvatar';
import { getTeam } from '@/data/teams';
import { POSITION_SHORT } from '@/lib/fantasy';
import type { FantasyPlayer, FantasyPosition } from '@/types';

// Um slot do campo: jogador escolhido ou posição vazia para preencher
export interface PitchSlot {
  key: string;
  player: FantasyPlayer | null;
  position: FantasyPosition | 'OUT'; // OUT = qualquer jogador de campo (banco)
  benchIndex?: number;               // presente nos slots do banco
  isCaptain?: boolean;
  badge?: string;                    // texto do selo (valor ou pontos)
  badgeTone?: 'value' | 'points' | 'live' | 'muted';
  dimmed?: boolean;                  // não jogou
  subbed?: 'in' | 'out';             // substituição automática
}

interface PitchViewProps {
  rows: PitchSlot[][];   // linhas dos titulares: [FWD, MID, DEF, GK]
  bench: PitchSlot[];
  onSlotClick?: (slot: PitchSlot) => void;
}

const BADGE_STYLES: Record<string, string> = {
  value: 'bg-black/60 text-cyan-300 border-cyan-400/20',
  points: 'bg-black/60 text-white border-white/15',
  live: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
  muted: 'bg-black/40 text-white/30 border-white/8',
};

function SlotChip({ slot, onClick }: { slot: PitchSlot; onClick?: () => void }) {
  if (!slot.player) {
    return (
      <button
        onClick={onClick}
        className="flex flex-col items-center gap-1 w-[60px] group"
      >
        <div className="w-11 h-11 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center group-active:scale-95 group-active:border-cyan-400/50 transition-all bg-black/20">
          <Plus size={16} className="text-white/30" />
        </div>
        <span className="text-[9px] font-semibold text-white/30 uppercase tracking-wide">
          {slot.position === 'OUT' ? 'Campo' : POSITION_SHORT[slot.position as FantasyPosition]}
        </span>
      </button>
    );
  }

  const p = slot.player;
  const lastName = p.name.split(' ').length > 1 ? p.name.split(' ').slice(-1)[0] : p.name;

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.93 }}
      className={`relative flex flex-col items-center gap-1 w-[60px] ${slot.dimmed ? 'opacity-45' : ''}`}
    >
      <div className="relative">
        <PlayerAvatar player={p} size={44} />
        {slot.isCaptain && (
          <span className="absolute -top-1 -left-1 w-[15px] h-[15px] rounded-full bg-gold text-black text-[9px] font-black flex items-center justify-center border border-black/30">
            C
          </span>
        )}
        <span className="absolute -bottom-0.5 -right-1 text-[11px] drop-shadow">{getTeam(p.teamId).flag}</span>
        {slot.subbed && (
          <span className={`absolute -top-1 -right-1 w-[14px] h-[14px] rounded-full text-[8px] font-black flex items-center justify-center border border-black/40 ${
            slot.subbed === 'in' ? 'bg-emerald-400 text-black' : 'bg-red-400 text-black'
          }`}>
            {slot.subbed === 'in' ? '↑' : '↓'}
          </span>
        )}
      </div>
      <span className="text-[9.5px] font-semibold text-white leading-tight truncate w-full text-center drop-shadow">
        {lastName}
      </span>
      {slot.badge !== undefined && (
        <span className={`text-[9px] font-bold px-1.5 py-px rounded-md border leading-tight ${BADGE_STYLES[slot.badgeTone ?? 'value']}`}>
          {slot.badge}
        </span>
      )}
    </motion.button>
  );
}

export default function PitchView({ rows, bench, onSlotClick }: PitchViewProps) {
  return (
    <div>
      {/* Campo */}
      <div
        className="relative rounded-2xl overflow-hidden border border-white/8 px-2 py-4"
        style={{
          background: 'linear-gradient(180deg, #0a3622 0%, #07271a 55%, #062017 100%)',
        }}
      >
        {/* Linhas do campo */}
        <div className="absolute inset-0 pointer-events-none">
          {/* riscas de relva */}
          <div className="absolute inset-0" style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 44px, rgba(255,255,255,0.025) 44px, rgba(255,255,255,0.025) 88px)',
          }} />
          {/* círculo central */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-white/12" />
          {/* área da baliza (em baixo) */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-44 h-16 border border-b-0 border-white/12 rounded-t-sm" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-7 border border-b-0 border-white/12" />
          {/* laterais */}
          <div className="absolute inset-2 border border-white/8 rounded-xl" />
        </div>

        {/* Linhas de jogadores: FWD → GK */}
        <div className="relative flex flex-col gap-4">
          {rows.map((row, i) => (
            <div key={i} className="flex justify-center gap-2.5 min-h-[84px] items-start" style={{ justifyContent: 'space-evenly' }}>
              {row.map(slot => (
                <SlotChip key={slot.key} slot={slot} onClick={() => onSlotClick?.(slot)} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Banco */}
      <div className="mt-3 bg-white/3 border border-white/8 rounded-2xl p-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/30 mb-2.5">
          Banco <span className="normal-case tracking-normal">· entram por esta ordem</span>
        </p>
        <div className="flex justify-between gap-1">
          {bench.map((slot, i) => (
            <div key={slot.key} className="flex flex-col items-center gap-1">
              <SlotChip slot={slot} onClick={() => onSlotClick?.(slot)} />
              <span className="text-[8px] text-white/20 font-bold">{i === 0 ? 'GR' : `${i}.º`}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
