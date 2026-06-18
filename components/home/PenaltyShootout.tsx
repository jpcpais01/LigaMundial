'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Trophy } from 'lucide-react';

// ─── Mini-jogo escondido 🥚: Marcador de Grandes Penalidades ───────────────────
// Toca 5× no subtítulo da página inicial para abrir. Remata para 3 zonas; o
// guarda-redes adivinha uma. 5 remates, classificação no fim. Tudo client-side.

type Dir = 'L' | 'C' | 'R';
type Phase = 'aim' | 'shooting' | 'result' | 'over';
type Shot = 'goal' | 'save';

const SHOTS = 5;
const CONFETTI = ['#fbbf24', '#34d399', '#3b82f6', '#fb7185', '#a78bfa', '#22d3ee'];

// Posições (em % da cena) para onde a bola viaja consoante a direção do remate.
const BALL_TARGET: Record<Dir, { left: string; top: string }> = {
  L: { left: '24%', top: '26%' },
  C: { left: '50%', top: '20%' },
  R: { left: '76%', top: '26%' },
};

// Onde o guarda-redes aterra quando mergulha para a sua aposta.
const KEEPER_LAND: Record<Dir, { left: string; top: string; rotate: number }> = {
  L: { left: '27%', top: '34%', rotate: -40 },
  C: { left: '50%', top: '30%', rotate: 0 },
  R: { left: '73%', top: '34%', rotate: 40 },
};

const KEEPER_REST = { left: '50%', top: '46%', rotate: 0 };
const BALL_REST = { left: '50%', top: '84%' };

const DIRS: { dir: Dir; label: string; emoji: string }[] = [
  { dir: 'L', label: 'Esquerda', emoji: '↖️' },
  { dir: 'C', label: 'Meio', emoji: '⬆️' },
  { dir: 'R', label: 'Direita', emoji: '↗️' },
];

function rating(goals: number): { title: string; emoji: string; note: string } {
  if (goals === 5) return { title: 'PERFEITO!', emoji: '🥇', note: 'Bola de Ouro do Mundial' };
  if (goals === 4) return { title: 'Craque!', emoji: '🌟', note: 'Nervos de aço' };
  if (goals === 3) return { title: 'Nada mal', emoji: '👍', note: 'Daria um titular' };
  if (goals === 2) return { title: 'Precisas de treino', emoji: '😅', note: 'Volta amanhã' };
  return { title: 'Banco de suplentes', emoji: '🪑', note: 'Foi por pouco... não' };
}

export default function PenaltyShootout({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>('aim');
  const [shot, setShot] = useState(0);          // remates já tomados
  const [goals, setGoals] = useState(0);
  const [history, setHistory] = useState<Shot[]>([]);
  const [last, setLast] = useState<Shot | null>(null);
  const [ball, setBall] = useState(BALL_REST);
  const [keeper, setKeeper] = useState<typeof KEEPER_REST>(KEEPER_REST);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const reset = useCallback(() => {
    clearTimers();
    setPhase('aim');
    setShot(0);
    setGoals(0);
    setHistory([]);
    setLast(null);
    setBall(BALL_REST);
    setKeeper(KEEPER_REST);
  }, []);

  // Reinicia ao abrir; bloqueia o scroll do body enquanto o jogo está aberto.
  useEffect(() => {
    if (open) {
      reset();
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; clearTimers(); };
    }
  }, [open, reset]);

  const shoot = (dir: Dir) => {
    if (phase !== 'aim') return;
    const guess = (['L', 'C', 'R'] as Dir[])[Math.floor(Math.random() * 3)];
    const saved = guess === dir;
    setPhase('shooting');

    // Guarda-redes mergulha sempre para a sua aposta.
    setKeeper(KEEPER_LAND[guess]);
    // Em defesa, a bola morre nas luvas (na posição do guarda); senão entra.
    setBall(saved ? { left: KEEPER_LAND[guess].left, top: KEEPER_LAND[guess].top } : BALL_TARGET[dir]);

    if (navigator.vibrate) navigator.vibrate(saved ? 30 : [12, 30, 60]);

    timers.current.push(setTimeout(() => {
      const result: Shot = saved ? 'save' : 'goal';
      setLast(result);
      setHistory(h => [...h, result]);
      if (!saved) setGoals(g => g + 1);
      setPhase('result');

      timers.current.push(setTimeout(() => {
        const taken = shot + 1;
        setShot(taken);
        if (taken >= SHOTS) {
          setPhase('over');
        } else {
          setBall(BALL_REST);
          setKeeper(KEEPER_REST);
          setLast(null);
          setPhase('aim');
        }
      }, 1250));
    }, 650));
  };

  const result = useMemo(() => rating(goals), [goals]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, #0b3d2e 0%, #07261d 45%, #04140f 100%)',
          }}
        >
          {/* Floodlight glows */}
          <div className="pointer-events-none absolute inset-0 opacity-60"
               style={{ background: 'radial-gradient(circle at 20% 8%, rgba(255,255,255,0.16), transparent 22%), radial-gradient(circle at 80% 8%, rgba(255,255,255,0.16), transparent 22%)' }} />

          {/* Top bar */}
          <div className="relative flex items-center justify-between px-4 pt-6 pb-2">
            <div className="flex items-center gap-2 text-white">
              <span className="text-lg">🥅</span>
              <span className="font-black tracking-tight">Grandes Penalidades</span>
            </div>
            <button
              onClick={() => { clearTimers(); onClose(); }}
              aria-label="Fechar"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scoreboard */}
          <div className="relative flex items-center justify-center gap-1.5 pb-2">
            {Array.from({ length: SHOTS }).map((_, i) => {
              const h = history[i];
              return (
                <span
                  key={i}
                  className={`w-3 h-3 rounded-full border transition-colors ${
                    h === 'goal' ? 'bg-emerald-400 border-emerald-300'
                      : h === 'save' ? 'bg-rose-500/70 border-rose-400'
                      : i === shot && phase !== 'over' ? 'border-gold animate-pulse' : 'border-white/25'
                  }`}
                />
              );
            })}
            <span className="ml-3 text-white/80 text-sm font-bold tabular-nums">{goals}<span className="text-white/30">/{SHOTS}</span></span>
          </div>

          {/* ─── Cena: baliza + guarda-redes + bola ─────────────────────────── */}
          <div className="relative mx-auto w-full max-w-md flex-1 min-h-0">
            <div className="absolute inset-x-3 top-2 bottom-2">
              {/* Relva */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden">
                <div className="absolute inset-0"
                     style={{ background: 'linear-gradient(to bottom, #0e5a3f 0%, #0a4630 60%, #073322 100%)' }} />
                {/* Riscas do relvado */}
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} className="absolute left-0 right-0"
                       style={{ top: `${40 + i * 12}%`, height: '6%', background: i % 2 ? 'rgba(255,255,255,0.04)' : 'transparent' }} />
                ))}
                {/* Marca de grande penalidade */}
                <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '80%' }}>
                  <div className="w-2 h-2 rounded-full bg-white/70" />
                </div>
              </div>

              {/* Baliza */}
              <div className="absolute" style={{ left: '8%', right: '8%', top: '8%', height: '34%' }}>
                {/* Rede */}
                <div className="absolute inset-0 rounded-t-md"
                     style={{
                       background:
                         'repeating-linear-gradient(0deg, rgba(255,255,255,0.18) 0 1px, transparent 1px 11px), repeating-linear-gradient(90deg, rgba(255,255,255,0.18) 0 1px, transparent 1px 11px)',
                       backgroundColor: 'rgba(255,255,255,0.04)',
                       maskImage: 'linear-gradient(to bottom, #000 70%, transparent)',
                       WebkitMaskImage: 'linear-gradient(to bottom, #000 70%, transparent)',
                     }} />
                {/* Postes + barra */}
                <div className="absolute -left-1.5 -top-1.5 bottom-0 w-1.5 rounded bg-white shadow-[0_0_12px_rgba(255,255,255,0.5)]" />
                <div className="absolute -right-1.5 -top-1.5 bottom-0 w-1.5 rounded bg-white shadow-[0_0_12px_rgba(255,255,255,0.5)]" />
                <div className="absolute -left-1.5 -right-1.5 -top-1.5 h-1.5 rounded bg-white shadow-[0_0_12px_rgba(255,255,255,0.5)]" />
              </div>

              {/* Zonas tocáveis (aparecem na fase de mira) */}
              {phase === 'aim' && DIRS.map(({ dir }) => (
                <button
                  key={dir}
                  onClick={() => shoot(dir)}
                  className="absolute group"
                  style={{
                    top: '8%', height: '34%',
                    left: dir === 'L' ? '8%' : dir === 'C' ? '36%' : '64%',
                    width: '28%',
                  }}
                  aria-label={`Rematar para ${dir}`}
                >
                  <span className="absolute inset-1 rounded-lg border border-dashed border-white/0 group-hover:border-gold/60 group-active:bg-gold/15 transition-all" />
                </button>
              ))}

              {/* Guarda-redes */}
              <motion.div
                className="absolute z-20"
                style={{ width: 46, marginLeft: -23, marginTop: -34 }}
                animate={{ left: keeper.left, top: keeper.top, rotate: keeper.rotate }}
                transition={{ type: 'spring', stiffness: 220, damping: 16 }}
              >
                <Keeper />
              </motion.div>

              {/* Bola */}
              <motion.div
                className="absolute z-30"
                style={{ width: 30, marginLeft: -15, marginTop: -15 }}
                animate={{
                  left: ball.left,
                  top: ball.top,
                  scale: phase === 'shooting' || phase === 'result' ? 0.62 : 1,
                  rotate: phase === 'shooting' || phase === 'result' ? 540 : 0,
                }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <span style={{ fontSize: 30, lineHeight: 1, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}>⚽</span>
              </motion.div>

              {/* Confetti no golo */}
              {phase === 'result' && last === 'goal' && <GoalConfetti />}

              {/* Texto do resultado */}
              <AnimatePresence>
                {phase === 'result' && last && (
                  <motion.div
                    className="absolute inset-x-0 z-40 flex justify-center"
                    style={{ top: '46%' }}
                    initial={{ scale: 0.4, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 14 }}
                  >
                    <span
                      className={`text-3xl font-black tracking-tight ${last === 'goal' ? 'text-emerald-300' : 'text-rose-400'}`}
                      style={{ textShadow: '0 2px 18px rgba(0,0,0,0.6)' }}
                    >
                      {last === 'goal' ? 'GOLO! ⚽' : 'DEFESA! 🧤'}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Controlos de mira */}
          <div className="relative px-4 pb-7 pt-2">
            {phase === 'over' ? (
              <GameOver result={result} goals={goals} onReplay={reset} onClose={() => { clearTimers(); onClose(); }} />
            ) : (
              <>
                <p className="text-center text-white/40 text-xs mb-3">
                  {phase === 'aim' ? 'Para onde queres rematar?' : ' '}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {DIRS.map(({ dir, label, emoji }) => (
                    <motion.button
                      key={dir}
                      disabled={phase !== 'aim'}
                      onClick={() => shoot(dir)}
                      whileTap={{ scale: 0.94 }}
                      className={`flex flex-col items-center gap-1 py-3 rounded-2xl border font-semibold text-sm transition-colors ${
                        phase === 'aim'
                          ? 'bg-white/8 border-white/15 text-white hover:bg-white/12'
                          : 'bg-white/4 border-white/8 text-white/30'
                      }`}
                    >
                      <span className="text-lg">{emoji}</span>
                      {label}
                    </motion.button>
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Guarda-redes em CSS ───────────────────────────────────────────────────────
function Keeper() {
  return (
    <div className="relative" style={{ width: 46, height: 60 }}>
      {/* Braços (em V, prontos a defender) */}
      <div className="absolute left-1/2 top-3 h-2 w-7 -translate-x-1/2 origin-left -rotate-[42deg] rounded-full bg-cyan-300" />
      <div className="absolute left-1/2 top-3 h-2 w-7 -translate-x-1/2 origin-right rotate-[42deg] rounded-full bg-cyan-300" />
      {/* Cabeça */}
      <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 rounded-full" style={{ background: '#f1c27d' }} />
      {/* Tronco */}
      <div className="absolute left-1/2 top-4 h-7 w-6 -translate-x-1/2 rounded-md bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
      {/* Pernas */}
      <div className="absolute left-1/2 top-[44px] h-4 w-2 -translate-x-[6px] rounded-sm bg-slate-900" />
      <div className="absolute left-1/2 top-[44px] h-4 w-2 translate-x-[2px] rounded-sm bg-slate-900" />
      {/* Luvas */}
      <div className="absolute left-[-3px] top-1 h-3 w-3 rounded-full bg-white" />
      <div className="absolute right-[-3px] top-1 h-3 w-3 rounded-full bg-white" />
    </div>
  );
}

// ─── Explosão de confetti no golo ──────────────────────────────────────────────
function GoalConfetti() {
  const pieces = useMemo(
    () => Array.from({ length: 26 }).map((_, i) => ({
      id: i,
      angle: (Math.PI * 2 * i) / 26 + Math.random() * 0.4,
      dist: 60 + Math.random() * 120,
      color: CONFETTI[i % CONFETTI.length],
      size: 6 + Math.random() * 6,
      delay: Math.random() * 0.08,
    })),
    [],
  );
  return (
    <div className="pointer-events-none absolute z-40" style={{ left: '50%', top: '24%' }}>
      {pieces.map(p => (
        <motion.span
          key={p.id}
          className="absolute block rounded-[2px]"
          style={{ width: p.size, height: p.size * 0.6, background: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: Math.cos(p.angle) * p.dist,
            y: Math.sin(p.angle) * p.dist + 40,
            opacity: [1, 1, 0],
            rotate: Math.random() * 540 - 270,
          }}
          transition={{ duration: 1, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

// ─── Ecrã final ────────────────────────────────────────────────────────────────
function GameOver({
  result, goals, onReplay, onClose,
}: {
  result: { title: string; emoji: string; note: string };
  goals: number;
  onReplay: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      className="rounded-3xl border border-white/10 bg-white/6 backdrop-blur-md p-5 text-center"
    >
      <div className="text-5xl mb-1">{result.emoji}</div>
      <p className="text-white font-black text-xl tracking-tight">{result.title}</p>
      <p className="text-white/50 text-sm mb-1">{result.note}</p>
      <div className="flex items-center justify-center gap-1.5 my-3 text-gold">
        <Trophy size={16} />
        <span className="font-black text-lg tabular-nums">{goals}<span className="text-white/30 text-sm"> / {SHOTS} golos</span></span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onReplay}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gold text-black font-bold active:scale-95 transition-transform"
        >
          <RotateCcw size={16} /> Outra vez
        </button>
        <button
          onClick={onClose}
          className="px-5 py-3 rounded-2xl bg-white/8 border border-white/12 text-white/70 font-semibold active:scale-95 transition-transform"
        >
          Sair
        </button>
      </div>
    </motion.div>
  );
}
