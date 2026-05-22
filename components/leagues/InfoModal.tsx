'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, CheckSquare, Trophy, Calendar, Users } from 'lucide-react';
import type { League } from '@/types';

interface InfoModalProps {
  league: League | null;
  onClose: () => void;
}

const PHASE_LABELS: Record<string, string> = {
  group: 'Fase de Grupos — 72 jogos',
  cup: 'Fase a Eliminar — 32 jogos',
  all: 'Todos os jogos — 104 jogos',
};

export default function InfoModal({ league, onClose }: InfoModalProps) {
  if (!league) return null;

  const isRegular = league.type === 'regular';
  const isChampion = league.type === 'champion';
  const isScorer = league.type === 'scorer';
  const prizes = league.prizeDistribution;

  return (
    <AnimatePresence>
      {league && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            <div className="bg-[#0d1117] border-t border-white/8 rounded-t-3xl p-6 pb-10 max-h-[80vh] overflow-y-auto">
              {/* Handle */}
              <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-6" />

              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/30 mb-1">
                    Informação da Liga
                  </p>
                  <h2 className="text-xl font-bold text-white tracking-tight">{league.name}</h2>
                  <p className="text-white/45 text-sm mt-1">{league.description}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex-shrink-0 ml-4"
                >
                  <X size={16} className="text-white/50" />
                </button>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/6 mb-6" />

              {/* Rules */}
              {isRegular && (
                <div className="mb-6">
                  <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/30 mb-3">
                    Sistema de Pontuação
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white/4 rounded-2xl px-4 py-3.5 border border-white/6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center">
                          <Target size={14} className="text-white/60" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">Resultado Exacto</p>
                          <p className="text-white/35 text-xs">Ex: prever 2–1 e acertar</p>
                        </div>
                      </div>
                      <span className="text-gold font-black text-lg">3 pts</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/4 rounded-2xl px-4 py-3.5 border border-white/6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center">
                          <CheckSquare size={14} className="text-white/60" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">1X2 Correcto</p>
                          <p className="text-white/35 text-xs">Vitória casa, empate ou fora</p>
                        </div>
                      </div>
                      <span className="text-gold font-black text-lg">1 pt</span>
                    </div>
                  </div>
                  <p className="text-white/30 text-xs mt-3 px-1">
                    Máximo de 4 pontos por jogo (resultado exacto + 1X2 correcto).
                  </p>
                </div>
              )}

              {isChampion && (
                <div className="mb-6">
                  <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/30 mb-3">
                    Como funciona
                  </p>
                  <div className="bg-white/4 rounded-2xl px-4 py-4 border border-white/6">
                    <p className="text-white/70 text-sm leading-relaxed">
                      Antes do início do torneio, escolhe a selecção que acreditas que vai vencer o Mundial.
                      No final, todos os jogadores que acertaram dividem igualmente o prémio total.
                    </p>
                  </div>
                </div>
              )}

              {isScorer && (
                <div className="mb-6">
                  <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/30 mb-3">
                    Como funciona
                  </p>
                  <div className="bg-white/4 rounded-2xl px-4 py-4 border border-white/6">
                    <p className="text-white/70 text-sm leading-relaxed">
                      Antes do início do torneio, escreve o nome do jogador que acreditas que vai marcar mais golos.
                      No final, todos os jogadores que acertaram dividem igualmente o prémio total.
                    </p>
                  </div>
                </div>
              )}

              {/* Phase */}
              <div className="mb-6">
                <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/30 mb-3">
                  Âmbito
                </p>
                <div className="flex items-center gap-3 bg-white/4 rounded-2xl px-4 py-3.5 border border-white/6">
                  <Calendar size={14} className="text-white/40" />
                  <span className="text-white/70 text-sm">{PHASE_LABELS[league.matchPhase]}</span>
                </div>
              </div>

              {/* Prize distribution */}
              <div className="mb-6">
                <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/30 mb-3">
                  Distribuição do Prémio
                </p>
                <div className="space-y-2">
                  <PrizeRow rank={1} percent={prizes.first} />
                  {prizes.second && <PrizeRow rank={2} percent={prizes.second} />}
                  {prizes.third && <PrizeRow rank={3} percent={prizes.third} />}
                </div>
              </div>

              {/* Entry */}
              <div className="flex items-center justify-between bg-white/4 rounded-2xl px-4 py-3.5 border border-white/6">
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <Users size={13} />
                  Entrada por jogador
                </div>
                <span className="text-white font-bold">{league.entryFee}€</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function PrizeRow({ rank, percent }: { rank: number; percent: number }) {
  const labels = ['1.º lugar', '2.º lugar', '3.º lugar'];
  const widths = [percent, percent, percent];
  const colors = ['bg-gold', 'bg-white/40', 'bg-white/20'];
  return (
    <div className="flex items-center gap-3 bg-white/4 rounded-2xl px-4 py-3 border border-white/6">
      <span className="text-white/40 text-xs w-14">{labels[rank - 1]}</span>
      <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colors[rank - 1]}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-white font-semibold text-sm w-10 text-right">{percent}%</span>
    </div>
  );
}
