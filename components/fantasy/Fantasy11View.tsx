'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Lock, Check, AlertCircle, Copy, Sparkles } from 'lucide-react';
import PitchView, { PitchSlot } from './PitchView';
import MarketSheet from './MarketSheet';
import PlayerSheet, { SwapTarget } from './PlayerSheet';
import FantasyLeaderboard from './FantasyLeaderboard';
import { PLAYERS_BY_ID } from '@/data/players';
import { ALL_MATCHES } from '@/data/matches';
import { useFantasyStats } from '@/hooks/useFantasyStats';
import { getFantasySquad, saveFantasySquad } from '@/lib/firestore';
import { formatMatchDate, timeUntil } from '@/lib/utils';
import {
  FANTASY_WEEKS, FANTASY_BUDGET, SQUAD_RULES, FORMATIONS, DEFAULT_FORMATION_ID, getFormation,
  getWeek, isWeekLocked, getDefaultWeekId,
  scoringMatchesOfWeek, countPositions, squadCost, validateSquad, computeSquadWeekPoints,
  playerMatchPoints, formatValue, teamsWithoutMatchInWeek,
} from '@/lib/fantasy';
import type { PlayerWeekResult } from '@/lib/fantasy';
import type { League, FantasyPlayer, FantasyPosition, FantasySquad } from '@/types';

interface SheetCtx {
  isCaptain: boolean;
  weekResult?: PlayerWeekResult | null;
  captainCounted?: boolean;
  moveDirect?: { label: string; action: () => void } | null;
  swapTargets?: SwapTarget[];
  swapLabel?: string;
  onMakeCaptain?: (() => void) | null;
  onRemove?: (() => void) | null;
  onBenchPriority?: ((dir: -1 | 1) => void) | null;
}

interface Fantasy11ViewProps {
  league: League;
  username: string;
  totalMembers: number;
}

type Tab = 'equipa' | 'classificacao';

interface Draft {
  starters: string[];
  bench: (string | null)[]; // 5 posições; [0] = GR
  captainId: string | null;
  formation: string;
}

type MarketCtx =
  | { kind: 'start'; position: FantasyPosition }
  | { kind: 'bench'; index: number };

const EMPTY_DRAFT: Draft = { starters: [], bench: [null, null, null, null, null], captainId: null, formation: DEFAULT_FORMATION_ID };

const ROW_CONFIG: { pos: FantasyPosition; min: number; max: number }[] = [
  { pos: 'FWD', min: SQUAD_RULES.fwdMin, max: SQUAD_RULES.fwdMax },
  { pos: 'MID', min: SQUAD_RULES.midMin, max: SQUAD_RULES.midMax },
  { pos: 'DEF', min: SQUAD_RULES.defMin, max: SQUAD_RULES.defMax },
  { pos: 'GK', min: SQUAD_RULES.gk, max: SQUAD_RULES.gk },
];

export default function Fantasy11View({ league, username, totalMembers }: Fantasy11ViewProps) {
  const byId = PLAYERS_BY_ID;
  const [tab, setTab] = useState<Tab>('equipa');
  const { stats, loaded: statsLoaded } = useFantasyStats();

  const [weekId, setWeekId] = useState(() => getDefaultWeekId());
  const week = getWeek(weekId)!;
  const locked = isWeekLocked(week);

  // ─── Equipas guardadas ─────────────────────────────────────────────────────
  const [squads, setSquads] = useState<Record<string, FantasySquad | null>>({});
  const squad = squads[weekId]; // undefined = a carregar

  useEffect(() => {
    if (squads[weekId] !== undefined) return;
    let cancelled = false;
    getFantasySquad(weekId, username).then(s => {
      if (!cancelled) setSquads(prev => ({ ...prev, [weekId]: s }));
    });
    return () => { cancelled = true; };
  }, [weekId, username, squads]);

  // ─── Rascunho de edição ────────────────────────────────────────────────────
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [dirtyWeeks, setDirtyWeeks] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (locked || drafts[weekId] !== undefined || squad === undefined) return;
    setDrafts(prev => ({
      ...prev,
      [weekId]: squad
        ? {
            starters: [...squad.starters],
            bench: [...squad.bench, ...Array(5).fill(null)].slice(0, 5),
            captainId: squad.captainId,
            formation: squad.formation ?? DEFAULT_FORMATION_ID,
          }
        : { ...EMPTY_DRAFT, bench: [...EMPTY_DRAFT.bench] },
    }));
  }, [locked, weekId, squad, drafts]);

  const draft = drafts[weekId];
  const dirty = dirtyWeeks.has(weekId);

  const updateDraft = useCallback((fn: (d: Draft) => Draft) => {
    setDrafts(prev => ({ ...prev, [weekId]: fn(prev[weekId] ?? { ...EMPTY_DRAFT, bench: [...EMPTY_DRAFT.bench] }) }));
    setDirtyWeeks(prev => new Set(prev).add(weekId));
    setErrors([]);
  }, [weekId]);

  // ─── Derivados do rascunho ─────────────────────────────────────────────────
  const draftAll = useMemo(
    () => draft ? [...draft.starters, ...draft.bench.filter((x): x is string => !!x)] : [],
    [draft],
  );
  const cost = useMemo(() => squadCost(draftAll, byId), [draftAll, byId]);
  const budgetLeft = Math.round((FANTASY_BUDGET - cost) * 10) / 10;
  const teamCounts = useMemo(() => {
    const c: Record<string, number> = {};
    draftAll.forEach(id => { const p = byId[id]; if (p) c[p.teamId] = (c[p.teamId] ?? 0) + 1; });
    return c;
  }, [draftAll, byId]);

  // Pontos totais por jogador em todo o torneio (mercado / ordenação)
  const pointsById = useMemo(() => {
    const totals: Record<string, number> = {};
    Object.values(stats).forEach(s => {
      const match = ALL_MATCHES.find(m => m.id === s.matchId);
      if (!match) return;
      Object.entries(s.players).forEach(([pid, line]) => {
        const p = byId[pid];
        if (!p) return;
        totals[pid] = (totals[pid] ?? 0) + playerMatchPoints(line, p.position, s, match).total;
      });
    });
    return totals;
  }, [stats, byId]);

  // ─── Mercado / fichas ──────────────────────────────────────────────────────
  const [marketCtx, setMarketCtx] = useState<MarketCtx | null>(null);
  const [sheetPlayerId, setSheetPlayerId] = useState<string | null>(null);

  const handlePick = (p: FantasyPlayer) => {
    if (!marketCtx) return;
    updateDraft(d => {
      if (marketCtx.kind === 'start') return { ...d, starters: [...d.starters, p.id] };
      const bench = [...d.bench];
      bench[marketCtx.index] = p.id;
      return { ...d, bench };
    });
    setMarketCtx(null);
  };

  // ─── Pontuação da jornada (modo fechado) ───────────────────────────────────
  const weekMatches = useMemo(() => scoringMatchesOfWeek(week), [week]);
  const noMatchTeamIds = useMemo(() => teamsWithoutMatchInWeek(week), [week]);
  const weekResult = useMemo(() => {
    if (!locked || !squad) return null;
    return computeSquadWeekPoints(squad, weekMatches, stats, byId);
  }, [locked, squad, weekMatches, stats, byId]);

  // ─── Slots para o campo ────────────────────────────────────────────────────
  const editSlots = useMemo((): { rows: PitchSlot[][]; bench: PitchSlot[] } | null => {
    if (locked || !draft) return null;
    const counts = countPositions(draft.starters, byId);

    // Always show exactly 11 total slots (filled + empty) using the chosen formation.
    // Empty slots per row = max(mandatory minimum, formation-target residual).
    // If the sum exceeds the remaining budget (can happen when a position is over-filled
    // beyond its formation target), trim slack from FWD → MID → DEF, never below mandatory.
    const f = getFormation(draft.formation);
    const DEFAULT_TARGETS: Record<FantasyPosition, number> = { GK: 1, DEF: f.DEF, MID: f.MID, FWD: f.FWD };
    const budget = SQUAD_RULES.starters - draft.starters.length;
    const emptyPerPos: Partial<Record<FantasyPosition, number>> = {};
    for (const cfg of ROW_CONFIG) {
      const filled = counts[cfg.pos];
      emptyPerPos[cfg.pos] = Math.max(cfg.min - filled, 0, DEFAULT_TARGETS[cfg.pos] - filled);
    }
    let total = (Object.values(emptyPerPos) as number[]).reduce((s, v) => s + v, 0);
    for (const cfg of ROW_CONFIG) { // [FWD, MID, DEF, GK] — trim least-critical first
      if (total <= budget) break;
      const mandatory = Math.max(cfg.min - counts[cfg.pos], 0);
      const cut = Math.min((emptyPerPos[cfg.pos] ?? 0) - mandatory, total - budget);
      (emptyPerPos[cfg.pos] as number) -= cut;
      total -= cut;
    }

    const rows = ROW_CONFIG.map(cfg => {
      const ids = draft.starters.filter(id => byId[id]?.position === cfg.pos);
      const slots: PitchSlot[] = ids.map(id => ({
        key: id,
        player: byId[id],
        position: cfg.pos,
        isCaptain: draft.captainId === id,
        badge: formatValue(byId[id].value),
        badgeTone: 'value' as const,
      }));
      for (let i = 0; i < (emptyPerPos[cfg.pos] ?? 0); i++) {
        slots.push({ key: `${cfg.pos}-empty-${i}`, player: null, position: cfg.pos });
      }
      return slots;
    });
    const bench: PitchSlot[] = draft.bench.map((id, i) => ({
      key: id ?? `bench-empty-${i}`,
      player: id ? byId[id] : null,
      position: i === 0 ? 'GK' : 'OUT',
      benchIndex: i,
      isCaptain: false,
      badge: id ? formatValue(byId[id].value) : undefined,
      badgeTone: 'value' as const,
    }));
    return { rows, bench };
  }, [locked, draft, byId]);

  const lockedSlots = useMemo((): { rows: PitchSlot[][]; bench: PitchSlot[] } | null => {
    if (!locked || !squad) return null;
    const result = weekResult!;
    const subbedInSet = new Set(result.autoSubs.map(s => s.in));
    const outByIn: Record<string, string> = {};
    result.autoSubs.forEach(s => { outByIn[s.in] = s.out; });

    const chipFor = (id: string, opts: { onBench?: boolean } = {}): PitchSlot => {
      const p = byId[id];
      const r = result.perPlayer[id];
      const isCaptain = squad.captainId === id;
      const showPts = r && (r.state === 'played' || r.state === 'didnt-play' || r.state === 'no-match');
      const pts = r ? (isCaptain && result.captainCounted ? r.points * 2 : r.points) : 0;
      return {
        key: `${id}${opts.onBench ? '-b' : ''}`,
        player: p ?? null,
        position: p?.position ?? 'OUT',
        isCaptain,
        badge: showPts ? `${pts} pts` : '–',
        badgeTone: r?.live ? 'live' : showPts && pts !== 0 ? 'points' : 'muted',
        dimmed: r?.state === 'didnt-play' || r?.state === 'no-match',
        subbed: subbedInSet.has(id) ? 'in' : undefined,
      };
    };

    const rows = ROW_CONFIG.map(cfg =>
      result.effectiveStarters
        .filter(id => byId[id]?.position === cfg.pos)
        .map(id => chipFor(id)),
    );
    // No banco: jogadores que saíram por substituição automática aparecem no
    // lugar do suplente que entrou
    const bench = squad.bench.map(id => {
      const replacedBy = outByIn[id];
      const shownId = replacedBy ?? id;
      const chip = chipFor(shownId, { onBench: true });
      if (replacedBy) chip.subbed = 'out';
      return chip;
    });
    return { rows, bench };
  }, [locked, squad, weekResult, byId]);

  // ─── Contexto da ficha de jogador ──────────────────────────────────────────
  const sheetPlayer = sheetPlayerId ? byId[sheetPlayerId] ?? null : null;
  const sheetCtx = useMemo((): SheetCtx | null => {
    if (!sheetPlayer) return null;
    if (locked) {
      return {
        isCaptain: squad?.captainId === sheetPlayer.id,
        weekResult: weekResult?.perPlayer[sheetPlayer.id] ?? null,
        captainCounted: weekResult?.captainCounted ?? false,
      };
    }
    if (!draft) return null;

    const id = sheetPlayer.id;
    const pos = sheetPlayer.position;
    const isStarter = draft.starters.includes(id);
    const benchIndex = draft.bench.indexOf(id);
    const counts = countPositions(draft.starters, byId);

    let moveDirect: { label: string; action: () => void } | null = null;
    const swapTargets: SwapTarget[] = [];
    let swapLabel = 'Trocar com';

    const doSwapStarterBench = (starterId: string, benchId: string) => {
      updateDraft(d => {
        const starters = d.starters.map(x => (x === starterId ? benchId : x));
        const bench = d.bench.map(x => (x === benchId ? starterId : x));
        const captainId = d.captainId === starterId ? null : d.captainId;
        return { ...d, starters, bench, captainId };
      });
      setSheetPlayerId(null);
    };

    if (isStarter) {
      swapLabel = 'Trocar com suplente';
      if (pos === 'GK') {
        const benchGk = draft.bench[0];
        if (benchGk) {
          swapTargets.push({ player: byId[benchGk], onSwap: () => doSwapStarterBench(id, benchGk) });
        } else {
          moveDirect = {
            label: 'Mover para o banco',
            action: () => {
              updateDraft(d => {
                const bench = [...d.bench]; bench[0] = id;
                return {
                  ...d,
                  starters: d.starters.filter(x => x !== id),
                  bench,
                  captainId: d.captainId === id ? null : d.captainId,
                };
              });
              setSheetPlayerId(null);
            },
          };
        }
      } else {
        const freeIdx = draft.bench.findIndex((x, i) => i > 0 && x === null);
        if (freeIdx > 0) {
          moveDirect = {
            label: 'Mover para o banco',
            action: () => {
              updateDraft(d => {
                const bench = [...d.bench]; bench[freeIdx] = id;
                return {
                  ...d,
                  starters: d.starters.filter(x => x !== id),
                  bench,
                  captainId: d.captainId === id ? null : d.captainId,
                };
              });
              setSheetPlayerId(null);
            },
          };
        }
        draft.bench.forEach((bid, i) => {
          if (i === 0 || !bid) return;
          swapTargets.push({ player: byId[bid], onSwap: () => doSwapStarterBench(id, bid) });
        });
      }
    } else if (benchIndex >= 0) {
      swapLabel = 'Trocar com titular';
      if (pos === 'GK') {
        const starterGk = draft.starters.find(x => byId[x]?.position === 'GK');
        if (starterGk) {
          swapTargets.push({ player: byId[starterGk], onSwap: () => doSwapStarterBench(starterGk, id) });
        } else if (draft.starters.length < SQUAD_RULES.starters) {
          moveDirect = {
            label: 'Promover a titular',
            action: () => {
              updateDraft(d => {
                const bench = [...d.bench]; bench[benchIndex] = null;
                return { ...d, starters: [...d.starters, id], bench };
              });
              setSheetPlayerId(null);
            },
          };
        }
      } else {
        const cfg = ROW_CONFIG.find(r => r.pos === pos)!;
        if (draft.starters.length < SQUAD_RULES.starters && counts[pos] < cfg.max) {
          moveDirect = {
            label: 'Promover a titular',
            action: () => {
              updateDraft(d => {
                const bench = [...d.bench]; bench[benchIndex] = null;
                return { ...d, starters: [...d.starters, id], bench };
              });
              setSheetPlayerId(null);
            },
          };
        }
        draft.starters.forEach(sid => {
          const sp = byId[sid];
          if (!sp || sp.position === 'GK') return;
          // a troca tem de respeitar os máximos por posição
          const after = { ...counts };
          after[sp.position]--; after[pos]++;
          const cfgIn = ROW_CONFIG.find(r => r.pos === pos)!;
          if (after[pos] > cfgIn.max) return;
          swapTargets.push({ player: sp, onSwap: () => doSwapStarterBench(sid, id) });
        });
      }
    }

    return {
      isCaptain: draft.captainId === id,
      moveDirect,
      swapTargets,
      swapLabel,
      onMakeCaptain: isStarter
        ? () => { updateDraft(d => ({ ...d, captainId: id })); setSheetPlayerId(null); }
        : null,
      onRemove: () => {
        updateDraft(d => ({
          ...d,
          starters: d.starters.filter(x => x !== id),
          bench: d.bench.map(x => (x === id ? null : x)),
          captainId: d.captainId === id ? null : d.captainId,
        }));
        setSheetPlayerId(null);
      },
      onBenchPriority: benchIndex > 0
        ? (dir: -1 | 1) => {
            const j = benchIndex + dir;
            if (j < 1 || j > 4) return;
            updateDraft(d => {
              const bench = [...d.bench];
              [bench[benchIndex], bench[j]] = [bench[j], bench[benchIndex]];
              return { ...d, bench };
            });
          }
        : null,
    };
  }, [sheetPlayer, locked, draft, squad, weekResult, byId, updateDraft]);

  // ─── Guardar ───────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!draft) return;
    const benchClean = draft.bench.filter((x): x is string => !!x);
    const errs = validateSquad(draft.starters, benchClean, draft.captainId, byId, draft.formation);
    setErrors(errs);
    if (errs.length > 0) return;
    setSaving(true);
    try {
      const data = {
        leagueId: league.id,
        username,
        weekId,
        starters: draft.starters,
        bench: benchClean,
        captainId: draft.captainId,
        formation: draft.formation,
        totalCost: cost,
      };
      await saveFantasySquad(data);
      const now = new Date().toISOString();
      setSquads(prev => ({
        ...prev,
        [weekId]: { ...data, id: `${weekId}_${username}`, formation: draft.formation, createdAt: prev[weekId]?.createdAt ?? now, updatedAt: now },
      }));
      setDirtyWeeks(prev => { const n = new Set(prev); n.delete(weekId); return n; });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  // Copiar a equipa da jornada anterior
  const prevWeek = FANTASY_WEEKS[FANTASY_WEEKS.findIndex(w => w.id === weekId) - 1];
  const canCopyPrev = !locked && draft && draftAll.length === 0 && !!prevWeek;
  const handleCopyPrev = async () => {
    if (!prevWeek) return;
    const prev = squads[prevWeek.id] !== undefined
      ? squads[prevWeek.id]
      : await getFantasySquad(prevWeek.id, username);
    if (squads[prevWeek.id] === undefined) setSquads(s => ({ ...s, [prevWeek.id]: prev }));
    if (!prev) { setErrors([`Não tens equipa guardada na ${prevWeek.label}.`]); return; }
    updateDraft(() => ({
      starters: [...prev.starters],
      bench: [...prev.bench, ...Array(5).fill(null)].slice(0, 5),
      captainId: prev.captainId,
      formation: prev.formation ?? DEFAULT_FORMATION_ID,
    }));
  };

  const marketPosition = marketCtx
    ? (marketCtx.kind === 'start' ? marketCtx.position : marketCtx.index === 0 ? 'GK' : 'OUT')
    : null;

  const slots = locked ? lockedSlots : editSlots;
  const loadingSquad = squad === undefined || (!locked && !draft);

  return (
    <div className="pb-28">
      {/* Tabs */}
      <div className="flex mx-4 bg-white/4 rounded-2xl p-1 mb-1 border border-white/6">
        {(['equipa', 'classificacao'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === t ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'
            }`}
          >
            {t === 'equipa' ? 'A Minha Equipa' : 'Classificação'}
          </button>
        ))}
      </div>

      {tab === 'classificacao' ? (
        <FantasyLeaderboard league={league} currentUsername={username} totalMembers={totalMembers} />
      ) : (
        <>
          {/* Selector de jornada */}
          <div className="flex items-center gap-2 overflow-x-auto px-4 py-3 scrollbar-none">
            {FANTASY_WEEKS.map(w => {
              const wLocked = isWeekLocked(w);
              return (
                <button
                  key={w.id}
                  onClick={() => { setWeekId(w.id); setErrors([]); }}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
                    weekId === w.id
                      ? 'bg-cyan-400 text-black'
                      : 'bg-white/5 text-white/50 border border-white/10'
                  }`}
                >
                  {wLocked && <Lock size={9} className={weekId === w.id ? 'text-black/60' : 'text-white/30'} />}
                  {w.label}
                </button>
              );
            })}
          </div>

          <div className="px-4">
            {/* Estado da jornada */}
            {locked ? (
              <div className="flex items-center justify-between bg-white/3 border border-white/8 rounded-2xl px-4 py-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <Lock size={13} className="text-white/30" />
                  <p className="text-white/45 text-xs font-medium">Jornada fechada</p>
                </div>
                {weekResult && (
                  <div className="flex items-center gap-2">
                    {!weekResult.finished && (
                      <span className="flex items-center gap-1.5 text-emerald-400/90 text-[10px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Em curso
                      </span>
                    )}
                    <span className="text-gold font-black text-lg leading-none">{weekResult.total}</span>
                    <span className="text-white/30 text-[10px]">pts</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/3 border border-white/8 rounded-2xl px-4 py-3 mb-3">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-white/45 text-xs">
                    Fecho: <span className="text-white/75 font-semibold">{formatMatchDate(week.deadline)}</span>
                    <span className="text-cyan-300/80"> · {timeUntil(week.deadline) || 'já fechou'}</span>
                  </p>
                  <p className="text-[11px]">
                    <span className={`font-bold ${budgetLeft < 0 ? 'text-red-400' : 'text-cyan-300'}`}>{formatValue(budgetLeft)}</span>
                    <span className="text-white/30"> livres</span>
                  </p>
                </div>
                {/* Barra de orçamento */}
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${cost > FANTASY_BUDGET ? 'bg-red-400' : 'bg-cyan-400'}`}
                    style={{ width: `${Math.min(100, (cost / FANTASY_BUDGET) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-white/25 text-[10px]">{draftAll.length}/16 jogadores</span>
                  <span className="text-white/25 text-[10px]">{formatValue(cost)} / {formatValue(FANTASY_BUDGET)}</span>
                </div>
                {/* Formation picker */}
                {draft && (
                  <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-white/6">
                    <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/30 flex-shrink-0">Form.</span>
                    <div className="flex gap-1.5">
                      {FORMATIONS.map(fm => (
                        <button
                          key={fm.id}
                          onClick={() => {
                            if (fm.id === draft.formation) return;
                            updateDraft(d => ({
                              ...d,
                              formation: fm.id,
                              starters: [],
                              captainId: null,
                            }));
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            draft.formation === fm.id
                              ? 'bg-cyan-400 text-black'
                              : 'bg-white/6 text-white/35 border border-white/10 active:bg-white/12'
                          }`}
                        >
                          {fm.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Campo */}
            {loadingSquad || !statsLoaded ? (
              <div className="flex justify-center py-16">
                <Loader2 size={22} className="animate-spin text-white/20" />
              </div>
            ) : locked && !squad ? (
              <div className="flex flex-col items-center py-14 gap-3 text-center px-6">
                <Sparkles size={30} className="text-white/15" />
                <p className="text-white/40 text-sm">Não criaste equipa nesta jornada.</p>
              </div>
            ) : slots ? (
              <>
                <PitchView
                  rows={slots.rows}
                  bench={slots.bench}
                  onSlotClick={slot => {
                    if (slot.player) { setSheetPlayerId(slot.player.id); return; }
                    if (locked) return;
                    if (slot.benchIndex !== undefined) setMarketCtx({ kind: 'bench', index: slot.benchIndex });
                    else setMarketCtx({ kind: 'start', position: slot.position as FantasyPosition });
                  }}
                />

                {/* Substituições automáticas */}
                {locked && weekResult && weekResult.autoSubs.length > 0 && (
                  <p className="text-white/30 text-[11px] mt-3 px-1 leading-relaxed">
                    ↕ {weekResult.autoSubs.length} substituiç{weekResult.autoSubs.length > 1 ? 'ões' : 'ão'} automática{weekResult.autoSubs.length > 1 ? 's' : ''}: titulares que não jogaram foram trocados por suplentes.
                  </p>
                )}
                {locked && weekResult && weekResult.captainId && !weekResult.captainCounted && weekResult.finished && (
                  <p className="text-white/30 text-[11px] mt-2 px-1">O capitão não jogou — sem bónus ×2 nesta jornada.</p>
                )}

                {/* Copiar jornada anterior */}
                {canCopyPrev && (
                  <button
                    onClick={handleCopyPrev}
                    className="w-full mt-3 flex items-center justify-center gap-2 bg-white/4 border border-white/8 rounded-2xl py-3 text-white/55 text-sm font-medium active:scale-[0.98] transition-transform"
                  >
                    <Copy size={13} />
                    Copiar equipa da {prevWeek?.label}
                  </button>
                )}

                {/* Erros de validação */}
                <AnimatePresence>
                  {errors.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mt-3 bg-red-500/8 border border-red-500/20 rounded-2xl px-4 py-3.5 space-y-1.5"
                    >
                      {errors.map((e, i) => (
                        <p key={i} className="flex items-start gap-2 text-red-400/90 text-xs leading-snug">
                          <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                          {e}
                        </p>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : null}
          </div>

          {/* Botão guardar fixo */}
          <AnimatePresence>
            {!locked && draft && (dirty || savedFlash) && (
              <motion.div
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
                className="fixed bottom-20 inset-x-4 z-40"
              >
                <button
                  onClick={handleSave}
                  disabled={saving || savedFlash}
                  className={`w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-colors ${
                    savedFlash ? 'bg-emerald-500 text-black' : 'bg-cyan-400 text-black active:bg-cyan-300'
                  }`}
                >
                  {saving ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : savedFlash ? (
                    <><Check size={15} /> Equipa guardada</>
                  ) : (
                    'Guardar equipa'
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Mercado */}
      <MarketSheet
        open={marketCtx !== null}
        position={marketPosition}
        onClose={() => setMarketCtx(null)}
        onPick={handlePick}
        excludeIds={new Set(draftAll)}
        budgetLeft={budgetLeft}
        teamCounts={teamCounts}
        pointsById={pointsById}
        noMatchTeamIds={noMatchTeamIds}
      />

      {/* Ficha de jogador */}
      <PlayerSheet
        player={sheetPlayer}
        isCaptain={sheetCtx?.isCaptain ?? false}
        locked={locked}
        weekResult={locked ? sheetCtx?.weekResult : null}
        captainCounted={locked ? sheetCtx?.captainCounted : false}
        onMakeCaptain={!locked ? sheetCtx?.onMakeCaptain : null}
        onRemove={!locked ? sheetCtx?.onRemove : null}
        moveDirect={!locked ? sheetCtx?.moveDirect : null}
        swapTargets={!locked ? sheetCtx?.swapTargets : undefined}
        swapLabel={!locked ? sheetCtx?.swapLabel : undefined}
        onBenchPriority={!locked ? sheetCtx?.onBenchPriority : null}
        onClose={() => setSheetPlayerId(null)}
      />
    </div>
  );
}
