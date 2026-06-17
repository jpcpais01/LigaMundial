'use client';
import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TEAMS_LIST } from '@/data/teams';

const CONFETTI_COLORS = ['#fbbf24', '#34d399', '#3b82f6', '#fb7185', '#a78bfa', '#22d3ee'];
const CHEERS = ['GOLOOO!', 'Força Mundial!', 'Que jogada!', 'Campeões!', 'Vamooos!'];

interface FallingItem {
  id: number;
  left: number;       // vw
  delay: number;      // s
  duration: number;   // s
  size: number;       // px
  spin: number;       // deg
  drift: number;      // vw
  type: 'flag' | 'confetti';
  flag: string;
  color: string;
}

function buildItems(): FallingItem[] {
  const flags = TEAMS_LIST.map(t => t.flag).filter(f => f && f.trim() !== '🏳');
  const items: FallingItem[] = [];
  for (let i = 0; i < 70; i++) {
    const isFlag = i % 2 === 0;
    items.push({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.9,
      duration: 2.4 + Math.random() * 1.8,
      size: isFlag ? 26 + Math.random() * 22 : 8 + Math.random() * 8,
      spin: (Math.random() - 0.5) * 720,
      drift: (Math.random() - 0.5) * 24,
      type: isFlag ? 'flag' : 'confetti',
      flag: flags[Math.floor(Math.random() * flags.length)] ?? '⚽',
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    });
  }
  return items;
}

export default function WorldCupCelebration({
  show,
  onDone,
}: {
  show: boolean;
  onDone: () => void;
}) {
  const items = useMemo(() => (show ? buildItems() : []), [show]);
  const cheer = useMemo(
    () => CHEERS[Math.floor(Math.random() * CHEERS.length)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [show],
  );

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onDone, 3600);
    return () => clearTimeout(t);
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Warm glow wash */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 1.4, times: [0, 0.3, 1] }}
            style={{
              background:
                'radial-gradient(ellipse at 50% 30%, rgba(251,191,36,0.18), transparent 60%)',
            }}
          />

          {/* Falling flags & confetti */}
          {items.map(item => (
            <motion.div
              key={item.id}
              className="absolute top-0"
              style={{ left: `${item.left}vw` }}
              initial={{ y: '-12vh', rotate: 0, opacity: 0 }}
              animate={{
                y: '112vh',
                x: `${item.drift}vw`,
                rotate: item.spin,
                opacity: [0, 1, 1, 0.9],
              }}
              transition={{
                duration: item.duration,
                delay: item.delay,
                ease: 'easeIn',
              }}
            >
              {item.type === 'flag' ? (
                <span style={{ fontSize: item.size, lineHeight: 1 }}>{item.flag}</span>
              ) : (
                <span
                  style={{
                    display: 'block',
                    width: item.size,
                    height: item.size * 0.5,
                    borderRadius: 2,
                    background: item.color,
                  }}
                />
              )}
            </motion.div>
          ))}

          {/* Center trophy + cheer */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0, rotate: -25, opacity: 0 }}
              animate={{ scale: [0, 1.35, 1], rotate: [-25, 8, 0], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2.4, times: [0, 0.25, 0.4, 1], ease: 'easeOut' }}
              style={{ fontSize: 96, filter: 'drop-shadow(0 8px 30px rgba(251,191,36,0.45))' }}
            >
              🏆
            </motion.div>
            <motion.p
              className="mt-2 text-2xl font-black tracking-tight text-white"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: [16, 0, 0, -8], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2.4, times: [0, 0.3, 0.6, 1] }}
              style={{ textShadow: '0 2px 24px rgba(251,191,36,0.5)' }}
            >
              {cheer}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
