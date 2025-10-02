import { GameWithRoundsAndPlayers } from '@/db/querys/game';
import { PlayerSelect } from '@/db/querys/player';
import i18n from '@/lib/i18n';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  return date.toLocaleDateString(i18n.language, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const ucFirst = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

// Helper function to get player scores for a specific round
export const getPlayerScoresForRound = (
  round: NonNullable<GameWithRoundsAndPlayers>['rounds'][0],
  playerId: number,
) => {
  const playerRound = round.playersToRounds.find(
    (ptr) => ptr.playerId === playerId,
  );
  return playerRound?.scores as number[] | null;
};

// Helper function to calculate total score
export const calculateTotalScore = (scores: number[] | null) => {
  if (!scores || scores.length === 0) return 0;
  return scores.reduce((sum, score) => sum + Number(score), 0);
};

// Helper function to get ranking with ties
export const getRankingWithTies = (
  players: any[],
  game: NonNullable<GameWithRoundsAndPlayers>,
) => {
  // For single round, rank by total score (highest wins in dominos)
  const playersWithScores = players.map((player) => {
    const scores = getPlayerScoresForRound(game.rounds[0], player.id);
    const totalScore = calculateTotalScore(scores);
    return { ...player, totalScore };
  });

  // Sort by total score (descending - highest score wins)
  playersWithScores.sort((a, b) => b.totalScore - a.totalScore);

  // Assign ranks with ties
  const rankedPlayers: ((typeof playersWithScores)[0] & { rank: number })[] =
    [];
  let currentRank = 1;

  for (let i = 0; i < playersWithScores.length; i++) {
    const player = playersWithScores[i];

    // If this is not the first player and they have the same score as previous
    if (i > 0 && playersWithScores[i - 1].totalScore === player.totalScore) {
      // Same rank as previous player
      rankedPlayers.push({ ...player, rank: rankedPlayers[i - 1].rank });
    } else {
      // New rank (could skip numbers if there were ties)
      rankedPlayers.push({ ...player, rank: currentRank });
    }

    currentRank = i + 2; // Next available rank
  }

  return rankedPlayers;
};

// Helper function to get ranking with ties for multiple rounds (by wins)
export const getRankingByWins = (players: PlayerSelect[]) => {
  // Sort by wins (descending - most wins first)
  const sortedPlayers = [...players].sort((a, b) => b.wins - a.wins);

  // Assign ranks with ties
  const rankedPlayers: ((typeof sortedPlayers)[0] & { rank: number })[] = [];
  let currentRank = 1;

  for (let i = 0; i < sortedPlayers.length; i++) {
    const player = sortedPlayers[i];

    // If this is not the first player and they have the same wins as previous
    if (i > 0 && sortedPlayers[i - 1].wins === player.wins) {
      // Same rank as previous player
      rankedPlayers.push({ ...player, rank: rankedPlayers[i - 1].rank });
    } else {
      // New rank
      rankedPlayers.push({ ...player, rank: currentRank });
    }

    currentRank = i + 2; // Next available rank
  }

  return rankedPlayers;
};
