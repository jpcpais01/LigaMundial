'use client';
import { useEffect, useState } from 'react';
import type { MatchPlayerStats } from '@/types';

// Poller partilhado de estatísticas fantasy: um único fetch a /api/fantasy
// a cada 60 s por separador aberto, independentemente do número de componentes.
const POLL_MS = 60_000;

export type FantasyStatsMap = Record<string, MatchPlayerStats>;

let current: FantasyStatsMap = {};
let loaded = false;
const subscribers = new Set<(s: FantasyStatsMap) => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let fetching = false;

async function poll() {
  if (fetching) return;
  fetching = true;
  try {
    const res = await fetch('/api/fantasy');
    if (res.ok) {
      const json = await res.json();
      current = json.stats ?? {};
      loaded = true;
      subscribers.forEach(fn => fn(current));
    }
  } catch {
    /* mantém as últimas estatísticas conhecidas */
  } finally {
    fetching = false;
  }
}

export function useFantasyStats(): { stats: FantasyStatsMap; loaded: boolean } {
  const [stats, setStats] = useState<FantasyStatsMap>(current);
  const [isLoaded, setIsLoaded] = useState(loaded);

  useEffect(() => {
    const update = (s: FantasyStatsMap) => { setStats(s); setIsLoaded(true); };
    subscribers.add(update);
    setStats(current);
    setIsLoaded(loaded);
    if (!timer) {
      poll();
      timer = setInterval(poll, POLL_MS);
    }
    return () => {
      subscribers.delete(update);
      if (subscribers.size === 0 && timer) {
        clearInterval(timer);
        timer = null;
      }
    };
  }, []);

  return { stats, loaded: isLoaded };
}
