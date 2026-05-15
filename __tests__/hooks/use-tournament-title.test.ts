import { renderHook } from '@testing-library/react-native';

import { useTournamentTitle } from '@/hooks/use-tournament-title';
import '@/lib/i18n';
import type { Player } from '@/lib/types';
import { useGame } from '@/stores/use-game';

const mkPlayer = (id: string, name: string, wins: number): Player => ({
  id,
  name,
  wins,
  losses: 0,
  isPlaying: true,
  score: [],
});

function renderTitle(): string {
  const { result } = renderHook(() => useTournamentTitle());
  return result.current;
}

it('returns "First to N" in normal mode', () => {
  // INITIAL_STATE already has tournamentMode: false, winningLimit: 150
  expect(renderTitle()).toBe('First to 150');
});

it('returns "Tournament" when in tournament mode with no players', () => {
  useGame.setState({ tournamentMode: true, players: [] });
  expect(renderTitle()).toBe('Tournament');
});

it('returns "Tournament" when all players have 0 wins', () => {
  const players = [mkPlayer('a', 'Alice', 0), mkPlayer('b', 'Bob', 0)];
  useGame.setState({ tournamentMode: true, players });
  expect(renderTitle()).toBe('Tournament');
});

it('returns single leader text when one player leads', () => {
  const players = [mkPlayer('a', 'Alice', 3), mkPlayer('b', 'Bob', 1)];
  useGame.setState({ tournamentMode: true, players });
  expect(renderTitle()).toBe('Tournament - Alice (3 wins)');
});

it('returns tie text when multiple players share the top wins', () => {
  const players = [mkPlayer('a', 'Alice', 3), mkPlayer('b', 'Bob', 3)];
  useGame.setState({ tournamentMode: true, players });
  expect(renderTitle()).toBe('Tournament - Alice, Bob (3 wins)');
});
