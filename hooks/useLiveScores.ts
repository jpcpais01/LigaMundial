'use client';
import { useEffect, useState } from 'react';
import type { LiveScoresMap } from '@/app/api/live/route';

// Poller partilhado: por mais componentes que mostrem resultados ao vivo,
// há apenas UM fetch a /api/live a cada 30 s por separador aberto.
const POLL_MS = 30_000;

let current: LiveScoresMap = {};
const subscribers = new Set<(s: LiveScoresMap) => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let fetching = false;

async function poll() {
  if (fetching) return;
  fetching = true;
  try {
    const res = await fetch('/api/live');
    if (res.ok) {
      current = await res.json();
      subscribers.forEach(fn => fn(current));
    }
  } catch {
    /* mantém os últimos resultados conhecidos */
  } finally {
    fetching = false;
  }
}

export function useLiveScores(): LiveScoresMap {
  const [scores, setScores] = useState<LiveScoresMap>(current);

  useEffect(() => {
    subscribers.add(setScores);
    setScores(current);
    if (!timer) {
      poll();
      timer = setInterval(poll, POLL_MS);
    }
    return () => {
      subscribers.delete(setScores);
      if (subscribers.size === 0 && timer) {
        clearInterval(timer);
        timer = null;
      }
    };
  }, []);

  return scores;
}
