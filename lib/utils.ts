import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { pt } from 'date-fns/locale';
import { TOURNAMENT_START } from '@/data/matches';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMatchDate(iso: string): string {
  return format(new Date(iso), "d MMM · HH'h'mm", { locale: pt });
}

export function formatShortDate(iso: string): string {
  return format(new Date(iso), 'd MMM', { locale: pt });
}

export function formatTime(iso: string): string {
  return format(new Date(iso), "HH'h'mm", { locale: pt });
}

export function timeUntil(iso: string): string {
  if (isPast(new Date(iso))) return '';
  return formatDistanceToNow(new Date(iso), { locale: pt, addSuffix: true });
}

// As apostas fecham 5 minutos antes do início do jogo
export const BETTING_CUTOFF_MS = 5 * 60 * 1000;

export function isBettingOpen(scheduledAt: string): boolean {
  return new Date(scheduledAt).getTime() - Date.now() > BETTING_CUTOFF_MS;
}

// Ligas especiais (campeão / melhor marcador) fecham 5 minutos antes
// do primeiro jogo de todo o torneio
export function isSpecialBettingOpen(): boolean {
  return isBettingOpen(TOURNAMENT_START);
}

export function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

export function phaseName(phase: string): string {
  const map: Record<string, string> = {
    group: 'Fase de Grupos',
    round32: 'Ronda de 32',
    round16: 'Oitavos de Final',
    qf: 'Quartos de Final',
    sf: 'Meias-Finais',
    '3rd': '3.º Lugar',
    final: 'Final',
  };
  return map[phase] || phase;
}

export function groupRoundName(round: number): string {
  return `Jornada ${round}`;
}

export function formatCurrency(amount: number): string {
  return `${amount.toFixed(0)}€`;
}

export function getOutcomeStr(outcome: string): string {
  if (outcome === 'home') return '1';
  if (outcome === 'draw') return 'X';
  return '2';
}
