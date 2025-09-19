import { insertPlayerToRound, insertRound, NewRound } from '@/db/querys/round';
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

    for (const player of players) {
      if (player.id === newRound.roundWinnerId?.toString()) {
        await incrementPlayerWins(Number(player.id));
      } else {
        await incrementPlayerLosses(Number(player.id));
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
