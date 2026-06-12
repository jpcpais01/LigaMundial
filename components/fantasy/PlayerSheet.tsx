'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Trash2, ArrowDownUp, ChevronLeft, ChevronRight } from 'lucide-react';
import PlayerAvatar from './PlayerAvatar';
import { getTeam } from '@/data/teams';
import { POSITION_LABELS, formatValue } from '@/lib/fantasy';
import type { PlayerWeekResult } from '@/lib/fantasy';
import type { FantasyPlayer } from '@/types';

export interface SwapTarget {
  player: FantasyPlayer;
  onSwap: () => void;
}

interface PlayerSheetProps {
  player: FantasyPlayer | null;
  isCaptain: boolean;
  locked: boolean;
  weekResult?: PlayerWeekResult | null;
  captainCounted?: boolean;
  // Acções de edição (apenas quando !locked)
  onMakeCaptain?: (() => void) | null;
  onRemove?: (() => void) | null;
  moveDirect?: { label: string; action: () => void } | null;
  swapTargets?: SwapTarget[];
  swapLabel?: string;
  onBenchPriority?: ((dir: -1 | 1) => void) | null;
  onClose: () => void;
}

const STATE_LABELS: Record<string, string> = {
  pending: 'Jogo por disputar',
  'didnt-play': 'Não jogou',
  'no-match': 'Sem jogo nesta jornada',
};

export default function PlayerSheet({
  player, isCaptain, locked, weekResult, captainCounted,
  onMakeCaptain, onRemove, moveDirect, swapTargets, swapLabel, onBenchPriority, onClose,
}: PlayerSheetProps) {
  return (
    <AnimatePresence>
      {player && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            <div className="bg-[#0d1117] border-t border-white/8 rounded-t-3xl p-5 pb-9 max-h-[80dvh] overflow-y-auto">
              <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-5" />

              {/* Cabeçalho */}
              <div className="flex items-center gap-3.5 mb-5">
                <PlayerAvatar player={player} size={56} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white tracking-tight truncate">{player.name}</h2>
                    {isCaptain && (
                      <span className="w-[18px] h-[18px] rounded-full bg-gold text-black text-[10px] font-black flex items-center justify-center flex-shrink-0">C</span>
                    )}
                  </div>
                  <p className="text-white/40 text-xs mt-0.5">
                    {getTeam(player.teamId).flag} {getTeam(player.teamId).name} · {POSITION_LABELS[player.position]}
                    {player.jersey ? ` · #${player.jersey}` : ''}{player.age ? ` · ${player.age} anos` : ''}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-cyan-300 font-black text-base leading-none">{formatValue(player.value)}</p>
                  <p className="text-white/25 text-[9px] mt-1">valor</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl bg-white/5 flex-shrink-0">
                  <X size={15} className="text-white/50" />
                </button>
              </div>

              {/* Pontuação da jornada (modo fechado) */}
              {locked && weekResult && (
                <div className="mb-5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/30 mb-2.5">
                    Pontos da jornada
                  </p>
                  {weekResult.state === 'played' ? (
                    <div className="bg-white/4 border border-white/6 rounded-2xl px-4 py-3 space-y-2">
                      {weekResult.breakdown.map((b, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-white/60 text-sm">{b.label}</span>
                          <span className={`font-bold text-sm ${b.pts >= 0 ? 'text-white' : 'text-red-400'}`}>
                            {b.pts > 0 ? `+${b.pts}` : b.pts}
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between pt-2 border-t border-white/6">
                        <span className="text-white/70 text-sm font-semibold">
                          Total{isCaptain && captainCounted ? ' (capitão ×2)' : ''}
                        </span>
                        <span className="text-gold font-black">
                          {isCaptain && captainCounted ? weekResult.points * 2 : weekResult.points}
                        </span>
                      </div>
                      {weekResult.live && (
                        <p className="text-emerald-400/80 text-[10px] font-medium flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Jogo a decorrer — pontos provisórios
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white/4 border border-white/6 rounded-2xl px-4 py-3.5">
                      <p className="text-white/45 text-sm">{STATE_LABELS[weekResult.state] ?? '—'}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Acções de edição */}
              {!locked && (
                <div className="space-y-2">
                  {onMakeCaptain && !isCaptain && (
                    <button
                      onClick={onMakeCaptain}
                      className="w-full flex items-center gap-3 bg-gold/10 border border-gold/25 rounded-2xl px-4 py-3.5 active:scale-[0.98] transition-transform"
                    >
                      <Crown size={15} className="text-gold" />
                      <span className="text-gold text-sm font-semibold">Fazer capitão (pontos ×2)</span>
                    </button>
                  )}

                  {moveDirect && (
                    <button
                      onClick={moveDirect.action}
                      className="w-full flex items-center gap-3 bg-white/4 border border-white/8 rounded-2xl px-4 py-3.5 active:scale-[0.98] transition-transform"
                    >
                      <ArrowDownUp size={15} className="text-white/50" />
                      <span className="text-white/80 text-sm font-semibold">{moveDirect.label}</span>
                    </button>
                  )}

                  {swapTargets && swapTargets.length > 0 && (
                    <div className="bg-white/3 border border-white/6 rounded-2xl p-3">
                      <p className="text-white/30 text-[10px] font-medium uppercase tracking-[0.15em] mb-2 px-1">
                        {swapLabel ?? 'Trocar com'}
                      </p>
                      <div className="space-y-1">
                        {swapTargets.map(t => (
                          <button
                            key={t.player.id}
                            onClick={t.onSwap}
                            className="w-full flex items-center gap-2.5 rounded-xl px-2 py-1.5 active:bg-white/8 transition-colors"
                          >
                            <PlayerAvatar player={t.player} size={30} />
                            <span className="text-white/75 text-[13px] font-medium flex-1 text-left truncate">{t.player.name}</span>
                            <span className="text-white/30 text-[10px]">{getTeam(t.player.teamId).flag} {formatValue(t.player.value)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {onBenchPriority && (
                    <div className="flex items-center justify-between bg-white/4 border border-white/8 rounded-2xl px-4 py-3">
                      <span className="text-white/60 text-sm">Prioridade no banco</span>
                      <div className="flex gap-2">
                        <button onClick={() => onBenchPriority(-1)} className="p-2 rounded-xl bg-white/6 active:bg-white/12">
                          <ChevronLeft size={14} className="text-white/60" />
                        </button>
                        <button onClick={() => onBenchPriority(1)} className="p-2 rounded-xl bg-white/6 active:bg-white/12">
                          <ChevronRight size={14} className="text-white/60" />
                        </button>
                      </div>
                    </div>
                  )}

                  {onRemove && (
                    <button
                      onClick={onRemove}
                      className="w-full flex items-center gap-3 bg-red-500/8 border border-red-500/20 rounded-2xl px-4 py-3.5 active:scale-[0.98] transition-transform"
                    >
                      <Trash2 size={15} className="text-red-400" />
                      <span className="text-red-400 text-sm font-semibold">Remover da equipa</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
