'use client';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import PlayerAvatar from './PlayerAvatar';
import { PLAYERS } from '@/data/players';
import { getTeam, TEAMS_LIST } from '@/data/teams';
import { POSITION_SHORT, SQUAD_RULES, formatValue } from '@/lib/fantasy';
import type { FantasyPlayer, FantasyPosition } from '@/types';

interface MarketSheetProps {
  open: boolean;
  position: FantasyPosition | 'OUT' | null; // OUT = DEF/MID/FWD
  onClose: () => void;
  onPick: (p: FantasyPlayer) => void;
  excludeIds: Set<string>;
  budgetLeft: number;
  teamCounts: Record<string, number>;
  pointsById: Record<string, number>;
  noMatchTeamIds: Set<string>; // selecções sem jogo que pontue nesta jornada
}

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

type SortKey = 'value' | 'points';

export default function MarketSheet({
  open, position, onClose, onPick, excludeIds, budgetLeft, teamCounts, pointsById, noMatchTeamIds,
}: MarketSheetProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('value');
  const [teamFilter, setTeamFilter] = useState('');
  const [outPos, setOutPos] = useState<FantasyPosition | 'OUT'>('OUT');

  const effectivePos = position === 'OUT' ? outPos : position;

  const list = useMemo(() => {
    if (!open) return [];
    const q = normalize(search.trim());
    let pool = PLAYERS.filter(p => {
      if (effectivePos === 'OUT') { if (p.position === 'GK') return false; }
      else if (effectivePos && p.position !== effectivePos) return false;
      if (teamFilter && p.teamId !== teamFilter) return false;
      if (q && !normalize(p.name).includes(q)) return false;
      return true;
    });
    pool = [...pool].sort((a, b) => {
      // selecções sem jogo nesta jornada vão para o fim
      const an = noMatchTeamIds.has(a.teamId) ? 1 : 0;
      const bn = noMatchTeamIds.has(b.teamId) ? 1 : 0;
      if (an !== bn) return an - bn;
      return sortKey === 'points'
        ? (pointsById[b.id] ?? 0) - (pointsById[a.id] ?? 0) || b.value - a.value
        : b.value - a.value || (pointsById[b.id] ?? 0) - (pointsById[a.id] ?? 0);
    });
    return pool;
  }, [open, search, sortKey, teamFilter, effectivePos, pointsById, noMatchTeamIds]);

  const shown = list.slice(0, 80);

  const pickState = (p: FantasyPlayer): { ok: boolean; reason?: string } => {
    if (excludeIds.has(p.id)) return { ok: false, reason: 'Na equipa' };
    if ((teamCounts[p.teamId] ?? 0) >= SQUAD_RULES.maxPerTeam) return { ok: false, reason: `${SQUAD_RULES.maxPerTeam}/${SQUAD_RULES.maxPerTeam} da selecção` };
    if (p.value > budgetLeft) return { ok: false, reason: 'Sem orçamento' };
    if (noMatchTeamIds.has(p.teamId)) return { ok: false, reason: 'Sem jogo na jornada' };
    return { ok: true };
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col"
            style={{ height: '88dvh' }}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            <div className="bg-[#0d1117] border-t border-white/8 rounded-t-3xl flex flex-col flex-1 min-h-0">
              <div className="px-5 pt-4 pb-3 flex-shrink-0">
                <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Mercado</h2>
                    <p className="text-white/35 text-xs mt-0.5">
                      Disponível: <span className="text-cyan-300 font-bold">{formatValue(Math.round(budgetLeft * 10) / 10)}</span>
                    </p>
                  </div>
                  <button onClick={onClose} className="p-2 rounded-xl bg-white/5">
                    <X size={16} className="text-white/50" />
                  </button>
                </div>

                {/* Pesquisa */}
                <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 mb-2.5">
                  <Search size={14} className="text-white/30 flex-shrink-0" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Procurar jogador…"
                    className="bg-transparent flex-1 text-sm text-white placeholder:text-white/25 outline-none min-w-0"
                  />
                  {search && (
                    <button onClick={() => setSearch('')}>
                      <X size={13} className="text-white/30" />
                    </button>
                  )}
                </div>

                {/* Filtros */}
                <div className="flex items-center gap-2">
                  {position === 'OUT' && (
                    <div className="flex bg-white/5 border border-white/8 rounded-xl p-0.5">
                      {(['OUT', 'DEF', 'MID', 'FWD'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => setOutPos(p)}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                            outPos === p ? 'bg-cyan-400/20 text-cyan-300' : 'text-white/35'
                          }`}
                        >
                          {p === 'OUT' ? 'Todos' : POSITION_SHORT[p]}
                        </button>
                      ))}
                    </div>
                  )}
                  <select
                    value={teamFilter}
                    onChange={e => setTeamFilter(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/8 rounded-xl px-2.5 py-2 text-xs text-white/70 outline-none min-w-0 appearance-none"
                  >
                    <option value="" className="bg-[#0d1117]">Todas as selecções</option>
                    {TEAMS_LIST.map(t => (
                      <option key={t.id} value={t.id} className="bg-[#0d1117]">{t.flag} {t.name}</option>
                    ))}
                  </select>
                  <div className="flex bg-white/5 border border-white/8 rounded-xl p-0.5 flex-shrink-0">
                    {(['value', 'points'] as SortKey[]).map(k => (
                      <button
                        key={k}
                        onClick={() => setSortKey(k)}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                          sortKey === k ? 'bg-white/10 text-white' : 'text-white/35'
                        }`}
                      >
                        {k === 'value' ? 'M€' : 'Pts'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lista */}
              <div className="flex-1 overflow-y-auto px-3 pb-8 min-h-0">
                {shown.length === 0 ? (
                  <p className="text-center text-white/25 text-sm py-10">Nenhum jogador encontrado.</p>
                ) : (
                  <div className="space-y-1">
                    {shown.map(p => {
                      const st = pickState(p);
                      const pts = pointsById[p.id] ?? 0;
                      return (
                        <button
                          key={p.id}
                          disabled={!st.ok}
                          onClick={() => onPick(p)}
                          className={`w-full flex items-center gap-3 rounded-2xl px-2.5 py-2 border transition-colors text-left ${
                            st.ok
                              ? 'bg-white/3 border-white/6 active:bg-cyan-400/10 active:border-cyan-400/20'
                              : 'bg-white/2 border-white/4 opacity-45'
                          }`}
                        >
                          <PlayerAvatar player={p} size={38} />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-[13px] font-semibold truncate leading-tight">{p.name}</p>
                            <p className="text-white/35 text-[10px] mt-0.5">
                              {getTeam(p.teamId).flag} {getTeam(p.teamId).shortName} · {POSITION_SHORT[p.position]}
                              {p.age ? ` · ${p.age} anos` : ''}
                            </p>
                          </div>
                          {pts > 0 && (
                            <div className="text-right flex-shrink-0">
                              <p className="text-white font-bold text-xs leading-none">{pts}</p>
                              <p className="text-white/25 text-[8.5px] mt-0.5">pts</p>
                            </div>
                          )}
                          <div className="text-right flex-shrink-0 w-[60px]">
                            {st.ok ? (
                              <span className="text-cyan-300 font-bold text-xs">{formatValue(p.value)}</span>
                            ) : (
                              <span className="text-white/30 text-[9px] font-medium leading-tight block">{st.reason}</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                    {list.length > shown.length && (
                      <p className="text-center text-white/20 text-[11px] py-3">
                        +{list.length - shown.length} jogadores — usa a pesquisa para refinar
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
