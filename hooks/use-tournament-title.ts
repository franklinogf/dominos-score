import { useT } from '@/hooks/use-translation';
import { useGame } from '@/stores/use-game';
import { useMemo } from 'react';

export function useTournamentTitle() {
  const players = useGame((state) => state.players);
  const winningLimit = useGame((state) => state.winningLimit);
  const tournamentMode = useGame((state) => state.tournamentMode);
  const { t } = useT();

  const title = useMemo(() => {
    if (!tournamentMode) {
      return t('game.firstTo', { limit: winningLimit });
    }

    // Find players with the most wins, handle ties by showing all tied players
    const maxWins =
      players.length > 0 ? Math.max(...players.map((p) => p.wins)) : 0;

    const playersWithMostWins = players.filter(
      (p) => p.wins === maxWins && p.wins > 0,
    );

    if (playersWithMostWins.length === 1) {
      // Single leader
      return t('game.tournamentLeader', {
        name: playersWithMostWins[0].name,
        wins: playersWithMostWins[0].wins,
      });
    } else if (playersWithMostWins.length > 1) {
      // Multiple leaders tied
      const names = playersWithMostWins.map((p) => p.name).join(', ');
      return t('game.tournamentTie', {
        names: names,
        wins: maxWins,
      });
    }

    // No wins yet
    return t('game.tournament');
  }, [players, winningLimit, tournamentMode, t]);

  return title;
}
