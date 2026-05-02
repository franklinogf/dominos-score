import { GameWithRoundsAndPlayers } from '@/db/querys/game';
import { GameStatus, GameType } from '@/lib/enums';
import { Player } from '@/lib/types';

type RestoredGameState = {
  players: Player[];
  gameStatus: GameStatus;
  tournamentMode: boolean;
  currentRoundNumber: number;
  winnerPlayerId: string | null;
  loserPlayerId: string | null;
  winningLimit: number;
  gameSize: number;
};

function getLatestDraftRound(game: NonNullable<GameWithRoundsAndPlayers>) {
  return [...game.rounds]
    .filter((round) => !round.roundWinnerId)
    .sort((a, b) => b.id - a.id)[0];
}

function getWinnerState(
  players: Player[],
  winningLimit: number,
  trioMode: boolean,
) {
  const playingPlayers = players.filter((player) => player.isPlaying);
  const playersAtLimit = playingPlayers.filter((player) => {
    const total = player.score.reduce((sum, score) => sum + score.value, 0);
    return total >= winningLimit;
  });

  if (playersAtLimit.length === 0) {
    const hasScores = playingPlayers.some((player) => player.score.length > 0);
    return {
      gameStatus: hasScores ? GameStatus.InProgress : GameStatus.Ready,
      winnerPlayerId: null,
      loserPlayerId: null,
    };
  }

  if (!trioMode) {
    return {
      gameStatus: GameStatus.Finished,
      winnerPlayerId: playersAtLimit[0].id,
      loserPlayerId: null,
    };
  }

  const playersWithTotals = playingPlayers.map((player) => ({
    player,
    total: player.score.reduce((sum, score) => sum + score.value, 0),
  }));
  const maxTotal = Math.max(...playersWithTotals.map((p) => p.total));
  const minTotal = Math.min(...playersWithTotals.map((p) => p.total));

  return {
    gameStatus: GameStatus.Finished,
    winnerPlayerId:
      playersWithTotals.find((p) => p.total === maxTotal)?.player.id ?? null,
    loserPlayerId:
      playersWithTotals.find((p) => p.total === minTotal)?.player.id ?? null,
  };
}

export function buildRestoredGameState(
  game: NonNullable<GameWithRoundsAndPlayers>,
  trioMode: boolean,
): RestoredGameState {
  const draftRound = getLatestDraftRound(game);
  const draftPlayerIds = new Set(
    draftRound?.playersToRounds.map((ptr) => String(ptr.playerId)) ?? [],
  );
  const scoresByPlayerId = new Map(
    draftRound?.playersToRounds.map((ptr) => [
      String(ptr.playerId),
      (ptr.scores as string[]).map((score, index) => ({
        id: `draft-${draftRound.id}-${ptr.playerId}-${index}`,
        value: Number(score),
      })),
    ]) ?? [],
  );
  const tournamentMode = game.type === GameType.TOURNAMENT;
  const hasDraftPlayers = draftPlayerIds.size > 0;

  const players: Player[] = game.players.map((player) => ({
    id: String(player.id),
    name: player.name,
    wins: player.wins,
    losses: player.losses,
    isPlaying: tournamentMode
      ? draftPlayerIds.has(String(player.id))
      : hasDraftPlayers
        ? draftPlayerIds.has(String(player.id))
        : true,
    score: scoresByPlayerId.get(String(player.id)) ?? [],
  }));

  const winnerState = getWinnerState(players, game.winningLimit, trioMode);
  const completedRoundsCount = game.rounds.filter(
    (round) => round.roundWinnerId,
  ).length;

  return {
    players,
    tournamentMode,
    winningLimit: game.winningLimit,
    gameSize: game.gameSize,
    currentRoundNumber: completedRoundsCount + 1,
    ...winnerState,
  };
}
