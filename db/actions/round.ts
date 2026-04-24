import { insertPlayerToRound, insertRound, NewRound } from '@/db/querys/round';
import { Player } from '@/lib/types';
import { calculateRoundOutcomes, RoundOutcomeOptions } from '@/lib/utils';
import { incrementPlayerLosses, incrementPlayerWins } from '../querys/player';

export async function newRoundWithResults(
  newRound: NewRound,
  players: Player[],
  options: RoundOutcomeOptions,
) {
  try {
    const roundId = await addNewRound(newRound);
    if (!roundId) {
      throw new Error('Failed to create new round');
    }
    await addResultsToRound(roundId, players);

    if (!newRound.roundWinnerId) return;

    const deltas = calculateRoundOutcomes(
      players,
      String(newRound.roundWinnerId),
      options,
    );

    for (const delta of deltas) {
      if (delta.winsIncrement > 0) {
        await incrementPlayerWins(Number(delta.id));
      }
      if (delta.lossesIncrement > 0) {
        await incrementPlayerLosses(Number(delta.id), delta.lossesIncrement);
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
