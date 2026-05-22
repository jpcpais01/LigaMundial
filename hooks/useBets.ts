'use client';
import { useState, useEffect, useCallback } from 'react';
import { getBet, saveBet, getUserBetsForLeague } from '@/lib/firestore';
import type { Bet, Outcome } from '@/types';

export function useBet(leagueId: string, matchId: string, username: string | undefined) {
  const [bet, setBet] = useState<Bet | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!username) return;
    getBet(leagueId, matchId, username).then(setBet);
  }, [leagueId, matchId, username]);

  const save = useCallback(async (exactHome: number | null, exactAway: number | null, outcome: Outcome) => {
    if (!username) return;
    setSaving(true);
    try {
      await saveBet({ username, leagueId, matchId, exactHome, exactAway, outcome });
      const updated = await getBet(leagueId, matchId, username);
      setBet(updated);
    } finally {
      setSaving(false);
    }
  }, [username, leagueId, matchId]);

  return { bet, saving, save };
}

export function useLeagueBets(leagueId: string, username: string | undefined) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!username) { setLoading(false); return; }
    setLoading(true);
    const data = await getUserBetsForLeague(leagueId, username);
    setBets(data);
    setLoading(false);
  }, [leagueId, username]);

  useEffect(() => { refresh(); }, [refresh]);

  return { bets, loading, refresh };
}
