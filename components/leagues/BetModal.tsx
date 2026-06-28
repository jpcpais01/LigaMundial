'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Loader2, Check, Lock } from 'lucide-react';
import { getTeam } from '@/data/teams';
import { formatMatchDate, isBettingOpen, getInitials } from '@/lib/utils';
import { saveBet, getBet, getMatchResult, getBetsForMatch, getUsersByUsernames } from '@/lib/firestore';
import { getOutcomeFromScore, calculateBetPoints, exactScoreBonus } from '@/lib/scoring';
import type { Match, Outcome, Bet, MatchResult, User } from '@/types';

interface BetModalProps {
  match: Match | null;
  leagueId: string;
  username: string;
  onClose: () => void;
}

export default function BetModal({ match, leagueId, username, onClose }: BetModalProps) {
  const [exactHome, setExactHome] = useState('');
  const [exactAway, setExactAway] = useState('');
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [existing, setExisting] = useState<Bet | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [otherBets, setOtherBets] = useState<Bet[] | null>(null);
  const [bettors, setBettors] = useState<Record<string, User>>({});

  const bettingOpen = match ? isBettingOpen(match.scheduledAt) : false;
  // Pontos calculados em tempo real a partir do resultado oficial
  const earnedPoints = existing && result ? calculateBetPoints(existing, result, exactScoreBonus(leagueId)) : null;

  // Com resultado exacto completo, o 1X2 fica bloqueado ao valor coerente
  const lockedOutcome: Outcome | null = (() => {
    const h = parseInt(exactHome);
    const a = parseInt(exactAway);
    return !isNaN(h) && !isNaN(a) ? getOutcomeFromScore(h, a) : null;
  })();

  useEffect(() => {
    if (!match) return;
    setLoading(true);
    Promise.all([
      getBet(leagueId, match.id, username),
      getMatchResult(match.id),
    ]).then(([b, r]) => {
      if (b) {
        setExisting(b);
        setExactHome(b.exactHome !== null ? String(b.exactHome) : '');
        setExactAway(b.exactAway !== null ? String(b.exactAway) : '');
        setOutcome(b.outcome);
      } else {
        setExisting(null);
        setExactHome(''); setExactAway(''); setOutcome(null);
      }
      setResult(r);
      setSaved(false);
      setLoading(false);
    });
  }, [match, leagueId, username]);

  // Apostas fechadas — carregar as apostas de todos os jogadores deste jogo
  useEffect(() => {
    if (!match || isBettingOpen(match.scheduledAt)) { setOtherBets(null); return; }
    let alive = true;
    getBetsForMatch(leagueId, match.id).then(async bets => {
      const others = bets
        .filter(b => b.username !== username)
        .sort((a, b) => a.username.localeCompare(b.username));
      const users = await getUsersByUsernames(others.map(b => b.username));
      if (!alive) return;
      setBettors(Object.fromEntries(users.map(u => [u.username, u])));
      setOtherBets(others);
    });
    return () => { alive = false; };
  }, [match, leagueId, username]);

  useEffect(() => {
    const h = parseInt(exactHome);
    const a = parseInt(exactAway);
    if (!isNaN(h) && !isNaN(a)) setOutcome(getOutcomeFromScore(h, a));
  }, [exactHome, exactAway]);

  const handleSave = async () => {
    // Re-verifica o prazo no momento de guardar (o modal pode ficar aberto)
    const finalOutcome = lockedOutcome ?? outcome;
    if (!match || !finalOutcome || !isBettingOpen(match.scheduledAt)) return;
    setSaving(true);
    try {
      await saveBet({
        username, leagueId, matchId: match.id,
        exactHome: exactHome !== '' ? parseInt(exactHome) : null,
        exactAway: exactAway !== '' ? parseInt(exactAway) : null,
        outcome: finalOutcome,
      });
      setSaved(true);
      setTimeout(onClose, 700);
    } finally {
      setSaving(false);
    }
  };

  if (!match) return null;
  const home = getTeam(match.homeTeamId);
  const away = getTeam(match.awayTeamId);

  return (
    <AnimatePresence>
      {match && (
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
            <div className="bg-[#0d1117] rounded-t-3xl border-t border-x border-white/8 p-5 pb-10 max-h-[85vh] overflow-y-auto">
              <div className="w-10 h-1 bg-white/12 rounded-full mx-auto mb-5" />

              {/* Match header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/25 mb-1">
                    {match.group ? `Grupo ${match.group} · Jornada ${match.round}` : match.phase.toUpperCase()}
                  </p>
                  <div className="flex items-center gap-3 text-white/30 text-xs">
                    <span className="flex items-center gap-1"><MapPin size={10} /> {match.city}</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {formatMatchDate(match.scheduledAt)}</span>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/8 transition-colors">
                  <X size={16} className="text-white/30" />
                </button>
              </div>

              {/* Teams */}
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-5xl leading-none">{home.flag}</span>
                  <p className="text-white font-bold text-sm">{home.shortName}</p>
                </div>

                {result ? (
                  <div className="flex items-center gap-2 px-4">
                    <span className="text-3xl font-black text-white tabular-nums">{result.homeScore}</span>
                    <span className="text-white/20 text-lg">–</span>
                    <span className="text-3xl font-black text-white tabular-nums">{result.awayScore}</span>
                  </div>
                ) : match.status !== 'scheduled' && match.homeScore !== undefined ? (
                  <div className="flex items-center gap-2 px-4">
                    <span className="text-3xl font-black text-white tabular-nums">{match.homeScore}</span>
                    <span className="text-white/20 text-lg">–</span>
                    <span className="text-3xl font-black text-white tabular-nums">{match.awayScore}</span>
                  </div>
                ) : (
                  <span className="text-white/15 font-bold text-lg px-4 tracking-widest">VS</span>
                )}

                <div className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-5xl leading-none">{away.flag}</span>
                  <p className="text-white font-bold text-sm">{away.shortName}</p>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 size={18} className="animate-spin text-white/20" />
                </div>
              ) : !bettingOpen ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <Lock size={18} className="text-white/20" />
                  <p className="text-white/30 text-sm">Apostas fechadas para este jogo.</p>
                  {existing && (
                    <div className="mt-2 bg-white/4 border border-white/6 rounded-2xl p-4 w-full">
                      <p className="text-white/30 text-xs mb-2 uppercase tracking-wider">A tua aposta</p>
                      <div className="flex items-center justify-center gap-3">
                        {existing.exactHome !== null && (
                          <span className="text-white font-bold text-xl tabular-nums">
                            {existing.exactHome} – {existing.exactAway}
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-gold/80 bg-gold/10 border border-gold/20 px-3 py-1 rounded-full">
                          {existing.outcome === 'home' ? `1 (${home.shortName})` : existing.outcome === 'draw' ? 'X' : `2 (${away.shortName})`}
                        </span>
                      </div>
                      {earnedPoints !== null && (
                        <p className="text-gold font-bold text-center mt-2 text-lg">+{earnedPoints} pts</p>
                      )}
                    </div>
                  )}

                  {/* Apostas dos outros jogadores — visíveis após o fecho */}
                  {otherBets !== null && (
                    <div className="mt-3 w-full text-left">
                      <p className="text-white/30 text-xs mb-2 uppercase tracking-wider">
                        Apostas dos jogadores {otherBets.length > 0 && `(${otherBets.length})`}
                      </p>
                      {otherBets.length === 0 ? (
                        <p className="text-white/20 text-xs py-2">
                          Mais ninguém apostou neste jogo.
                        </p>
                      ) : (
                        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                          {otherBets.map(b => {
                            const u = bettors[b.username];
                            const pts = result ? calculateBetPoints(b, result, exactScoreBonus(leagueId)) : null;
                            return (
                              <div
                                key={b.username}
                                className="flex items-center gap-2.5 bg-white/3 border border-white/6 rounded-xl px-3 py-2"
                              >
                                <div
                                  className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                                  style={{ backgroundColor: u?.avatarUrl ? undefined : u?.avatarColor || '#6366f1' }}
                                >
                                  {u?.avatarUrl
                                    ? <img src={u.avatarUrl} alt={b.username} className="w-full h-full object-cover" />
                                    : getInitials(b.username)}
                                </div>
                                <span className="text-white/70 text-xs font-medium flex-1 truncate">{b.username}</span>
                                {b.exactHome !== null && (
                                  <span className="text-white font-bold text-xs tabular-nums">
                                    {b.exactHome}–{b.exactAway}
                                  </span>
                                )}
                                <span className="text-[10px] font-semibold text-white/40 bg-white/6 border border-white/8 px-2 py-0.5 rounded-full">
                                  {b.outcome === 'home' ? '1' : b.outcome === 'draw' ? 'X' : '2'}
                                </span>
                                {pts !== null && (
                                  <span className={`text-xs font-bold w-9 text-right ${pts > 0 ? 'text-gold' : 'text-white/25'}`}>
                                    +{pts}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Exact score */}
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/25 mb-2">
                      Resultado Exacto <span className="text-gold/60 normal-case tracking-normal">+3 pts</span>
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        type="number" min="0" max="20"
                        value={exactHome}
                        onChange={e => setExactHome(e.target.value)}
                        placeholder="–"
                        className="flex-1 bg-[#161b27] border border-white/8 rounded-2xl text-center text-white
                                   text-2xl font-bold py-3.5 focus:outline-none focus:border-white/20 transition-all
                                   [appearance:textfield]"
                      />
                      <span className="text-white/15 text-xl font-light">–</span>
                      <input
                        type="number" min="0" max="20"
                        value={exactAway}
                        onChange={e => setExactAway(e.target.value)}
                        placeholder="–"
                        className="flex-1 bg-[#161b27] border border-white/8 rounded-2xl text-center text-white
                                   text-2xl font-bold py-3.5 focus:outline-none focus:border-white/20 transition-all
                                   [appearance:textfield]"
                      />
                    </div>
                  </div>

                  {/* 1X2 */}
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/25 mb-2">
                      1X2 <span className="text-gold/60 normal-case tracking-normal">+1 pt</span>
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {(['home', 'draw', 'away'] as Outcome[]).map(o => {
                        const blocked = lockedOutcome !== null && o !== lockedOutcome;
                        return (
                          <button
                            key={o}
                            onClick={() => { if (!blocked) setOutcome(o); }}
                            disabled={blocked}
                            className={`py-3 rounded-2xl text-sm font-semibold transition-all ${
                              outcome === o
                                ? 'bg-gold text-black'
                                : blocked
                                  ? 'bg-white/2 text-white/15 border border-white/4'
                                  : 'bg-white/4 text-white/50 border border-white/8 hover:bg-white/8'
                            }`}
                          >
                            {o === 'home' ? `1  ${home.flag}` : o === 'draw' ? 'X' : `${away.flag}  2`}
                          </button>
                        );
                      })}
                    </div>
                    {lockedOutcome !== null && (
                      <p className="text-white/25 text-[11px] mt-2">
                        O 1X2 é definido automaticamente pelo resultado exacto.
                      </p>
                    )}
                  </div>

                  {/* Save */}
                  <motion.button
                    onClick={handleSave}
                    disabled={saving || !outcome || saved}
                    className={`w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                      saved
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                        : 'bg-gold-gradient text-black disabled:opacity-35'
                    }`}
                    whileTap={{ scale: 0.97 }}
                  >
                    {saved
                      ? <><Check size={15} /> Aposta guardada</>
                      : saving
                        ? <><Loader2 size={15} className="animate-spin" /> A guardar...</>
                        : existing ? 'Actualizar aposta' : 'Confirmar aposta'
                    }
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
