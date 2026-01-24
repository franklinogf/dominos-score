import { insertPlayerToRound, insertRound, NewRound } from '@/db/querys/round';
import { getMultiLoseSetting, getTrioModeSetting } from '@/db/querys/settings';
import { Player } from '@/lib/types';
import { incrementPlayerLosses, incrementPlayerWins } from '../querys/player';

export async function newRoundWithResults(
  newRound: NewRound,
  players: Player[],
) {
  try {
    const roundId = await addNewRound(newRound);
    if (!roundId) {
      throw new Error('Failed to create new round');
    }
    await addResultsToRound(roundId, players);

    // Get settings to determine win/loss logic
    const isTrioMode = await getTrioModeSetting();
    const isMultiLoseEnabled = await getMultiLoseSetting();

    if (isTrioMode) {
      // In trio mode: highest score wins, lowest score loses, others stay unchanged
      if (players.length > 1) {
        // Calculate total scores for each player
        const playersWithTotals = players.map((player) => ({
          ...player,
          totalScore: player.score.reduce((sum, score) => sum + score.value, 0),
        }));

        // Find the minimum and maximum scores
        const minScore = Math.min(
          ...playersWithTotals.map((p) => p.totalScore),
        );
        const maxScore = Math.max(
          ...playersWithTotals.map((p) => p.totalScore),
        );

        // Check for players with no score (tied losers)
        const playersWithNoScore = playersWithTotals.filter(
          (p) => p.score.length === 0,
        );

        // Award wins and losses
        for (const player of playersWithTotals) {
          if (player.totalScore === maxScore) {
            await incrementPlayerWins(Number(player.id));
          } else if (playersWithNoScore.length > 1) {
            // Multiple players with no score - they all lose
            if (player.score.length === 0) {
              const lossIncrement = isMultiLoseEnabled ? 2 : 1;
              await incrementPlayerLosses(Number(player.id), lossIncrement);
            }
          } else if (player.totalScore === minScore) {
            // Single loser with lowest score
            const lossIncrement =
              player.score.length === 0 && isMultiLoseEnabled ? 2 : 1;
            await incrementPlayerLosses(Number(player.id), lossIncrement);
          }
          // Players in between don't get wins or losses
        }
      }
    } else {
      // Traditional mode: winner gets a win, everyone else gets a loss
      for (const player of players) {
        if (player.id === newRound.roundWinnerId?.toString()) {
          await incrementPlayerWins(Number(player.id));
        } else {
          const lossIncrement =
            player.score.length === 0 && isMultiLoseEnabled ? 2 : 1;
          await incrementPlayerLosses(Number(player.id), lossIncrement);
        }
      }
    }
  } catch (error) {
    console.error('Error creating new round with results:', error);
  }
}

export async function addNewRound(newRound: NewRound) {
  try {
    const result = await insertRound(newRound);
    const roundId = result?.[0].insertedId;
    return roundId;
  } catch (error) {
    console.error('Error adding new round:', error);
  }
}

export async function addResultsToRound(roundId: number, players: Player[]) {
  try {
    for (const player of players) {
      const scores = player.score.map((s) => s.value.toString());
      await insertPlayerToRound(roundId, Number(player.id), scores);
    }
  } catch (error) {
    console.error('Error adding players to round:', error);
  }
}
