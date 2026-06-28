'use client';
import { useEffect, useMemo, useState } from 'react';
import { getAllResults } from '@/lib/firestore';
import { resolveKnockout } from '@/lib/bracket';
import { GROUP_MATCHES } from '@/data/matches';
import type { Match, MatchResult } from '@/types';

// Poller partilhado dos resultados — preenche o quadro a eliminar com as
// selecções reais à medida que os jogos das fases anteriores são liquidados.
// Os resultados mudam poucas vezes, por isso refresca-se a cada 60 s.
const POLL_MS = 60_000;

let current: Record<string, MatchResult> = {};
let loaded = false;
const subscribers = new Set<(r: Record<string, MatchResult>) => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let fetching = false;

async function poll() {
  if (fetching) return;
  fetching = true;
  try {
    current = await getAllResults();
    loaded = true;
    subscribers.forEach(fn => fn(current));
  } catch {
    /* mantém os últimos resultados conhecidos */
  } finally {
    fetching = false;
  }
}

export function useResults(): Record<string, MatchResult> {
  const [results, setResults] = useState(current);

  useEffect(() => {
    subscribers.add(setResults);
    setResults(current);
    if (!loaded) poll();
    if (!timer) timer = setInterval(poll, POLL_MS);
    return () => {
      subscribers.delete(setResults);
      if (subscribers.size === 0 && timer) {
        clearInterval(timer);
        timer = null;
      }
    };
  }, []);

  return results;
}

// Jogos com o quadro a eliminar já resolvido (equipas reais onde possível).
export function useResolvedMatches(): { group: Match[]; knockout: Match[]; all: Match[] } {
  const results = useResults();
  return useMemo(() => {
    const knockout = resolveKnockout(results);
    return { group: GROUP_MATCHES, knockout, all: [...GROUP_MATCHES, ...knockout] };
  }, [results]);
}
