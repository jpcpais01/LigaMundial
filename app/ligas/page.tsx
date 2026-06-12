'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LEAGUES } from '@/data/leagues';
import LeagueCard from '@/components/leagues/LeagueCard';
import { useAuthContext } from '@/components/auth/AuthContext';
import { getLeagueMembers, getAllLeagueConfigs } from '@/lib/firestore';

export default function LigasPage() {
  const { user } = useAuthContext();
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [leagueConfigs, setLeagueConfigs] = useState<Record<string, { backgroundUrl?: string }>>({});

  useEffect(() => {
    async function loadData() {
      const [configs] = await Promise.all([
        getAllLeagueConfigs(),
        Promise.all(
          LEAGUES.map(async l => {
            const members = await getLeagueMembers(l.id);
            setMemberCounts(prev => ({ ...prev, [l.id]: members.length }));
          })
        ),
      ]);
      setLeagueConfigs(configs);
    }
    loadData();
  }, []);

  const generalLeagues = LEAGUES.filter(l => l.id === 'fase-grupos' || l.id === 'fase-copa');
  const fantasyLeagues = LEAGUES.filter(l => l.type === 'fantasy');
  const extraLeagues = LEAGUES.filter(l => l.id.startsWith('extra'));

  return (
    <div className="min-h-dvh">
      <header className="px-4 pt-14 pb-6">
        <h1 className="text-2xl font-black tracking-tight text-white">Ligas</h1>
        <p className="text-white/35 text-sm mt-1">Escolhe uma liga para apostar</p>
      </header>

      {/* General leagues */}
      <section className="px-4 mb-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/30 mb-3">
          Ligas Gerais
        </p>
        <div className="space-y-3">
          {generalLeagues.map((l, i) => (
            <LeagueCard
              key={l.id}
              league={l}
              memberCount={memberCounts[l.id] || 0}
              isJoined={user?.joinedLeagues.includes(l.id) || false}
              index={i}
              backgroundUrl={leagueConfigs[l.id]?.backgroundUrl}
            />
          ))}
        </div>
      </section>

      {/* Fantasy */}
      <section className="px-4 mb-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/30 mb-3">
          Fantasy
        </p>
        <div className="space-y-3">
          {fantasyLeagues.map((l, i) => (
            <LeagueCard
              key={l.id}
              league={l}
              memberCount={memberCounts[l.id] || 0}
              isJoined={user?.joinedLeagues.includes(l.id) || false}
              index={i + 2}
              backgroundUrl={leagueConfigs[l.id]?.backgroundUrl}
            />
          ))}
        </div>
      </section>

      {/* Extra leagues */}
      <section className="px-4 mb-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/30 mb-3">
          Ligas Extra
        </p>
        <div className="space-y-3">
          {extraLeagues.map((l, i) => (
            <LeagueCard
              key={l.id}
              league={l}
              memberCount={memberCounts[l.id] || 0}
              isJoined={user?.joinedLeagues.includes(l.id) || false}
              index={i + 3}
              backgroundUrl={leagueConfigs[l.id]?.backgroundUrl}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
