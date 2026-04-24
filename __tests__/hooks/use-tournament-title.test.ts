import React, { act } from 'react';
import TestRenderer from 'react-test-renderer';

jest.mock('@/hooks/use-translation', () => ({
  useT: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (key === 'game.firstTo') return `First to ${opts?.limit}`;
      if (key === 'game.tournamentLeader') return `${opts?.name} leads with ${opts?.wins}`;
      if (key === 'game.tournamentTie') return `${opts?.names} tied at ${opts?.wins}`;
      if (key === 'game.tournament') return 'Tournament';
      return key;
    },
  }),
}));

jest.mock('@/db/querys/settings', () => ({
  getTrioModeSetting: jest.fn().mockResolvedValue(false),
  getMultiLoseSetting: jest.fn().mockResolvedValue(false),
}));

import { useTournamentTitle } from '@/hooks/use-tournament-title';
import { useGame } from '@/stores/use-game';
import { GameStatus } from '@/lib/enums';
import type { Player } from '@/lib/types';

const INITIAL_STATE = {
  gameStatus: GameStatus.NotStarted,
  tournamentMode: false,
  trioMode: false,
  multiLose: false,
  players: [] as Player[],
  gameSize: 2,
  winningLimit: 150,
  winnerPlayerId: null,
  loserPlayerId: null,
  currentGameId: undefined,
  currentRoundNumber: 1,
};

const mkPlayer = (id: string, name: string, wins: number): Player => ({
  id,
  name,
  wins,
  losses: 0,
  isPlaying: true,
  score: [],
});

// Always set state BEFORE calling renderTitle so no renderer is mounted during setState.
let renderer: TestRenderer.ReactTestRenderer | null = null;

afterEach(() => {
  if (renderer) {
    act(() => renderer!.unmount());
    renderer = null;
  }
});

beforeEach(() => {
  useGame.setState(INITIAL_STATE);
});

function renderTitle(): string {
  let result = '';
  function TestComp() {
    result = useTournamentTitle();
    return null;
  }
  act(() => { renderer = TestRenderer.create(React.createElement(TestComp)); });
  return result;
}

describe('useTournamentTitle', () => {
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
    expect(renderTitle()).toBe('Alice leads with 3');
  });

  it('returns tie text when multiple players share the top wins', () => {
    const players = [mkPlayer('a', 'Alice', 3), mkPlayer('b', 'Bob', 3)];
    useGame.setState({ tournamentMode: true, players });
    expect(renderTitle()).toBe('Alice, Bob tied at 3');
  });
});
