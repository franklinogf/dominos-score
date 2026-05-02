import {
  clearDraftRoundScores,
  getOrCreateDraftRound,
  insertRound,
  NewRound,
  updateRoundWinner,
  upsertPlayerDraftScores,
} from '@/db/querys/round';
import { Player } from '@/lib/types';
import { calculateRoundOutcomes, RoundOutcomeOptions } from '@/lib/utils';
import { incrementPlayerLosses, incrementPlayerWins } from '../querys/player';

export async function newRoundWithResults(
  newRound: NewRound,
  players: Player[],
  options: RoundOutcomeOptions,
) {
  try {
    const roundId = await getOrCreateDraftRound(newRound.gameId);
    if (!roundId) {
      throw new Error('Failed to create new round');
    }
    await addResultsToRound(roundId, players);

    if (!newRound.roundWinnerId) return;

    await updateRoundWinner(roundId, newRound.roundWinnerId);

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
      await upsertPlayerDraftScores(roundId, Number(player.id), scores);
    }
  } catch (error) {
    console.error('Error adding players to round:', error);
  }
}

export async function persistDraftRound(gameId: number, players: Player[]) {
  try {
    const roundId = await getOrCreateDraftRound(gameId);
    if (!roundId) {
      throw new Error('Failed to create draft round');
    }

    await clearDraftRoundScores(roundId);

    for (const player of players) {
      if (!player.isPlaying && player.score.length === 0) {
        continue;
      }

      await upsertPlayerDraftScores(
        roundId,
        Number(player.id),
        player.score.map((score) => score.value.toString()),
      );
    }
  } catch (error) {
    console.error('Error persisting draft round:', error);
  }
}

export async function clearCurrentDraftRound(gameId: number) {
  try {
    const roundId = await getOrCreateDraftRound(gameId);
    if (roundId) {
      await clearDraftRoundScores(roundId);
    }
  } catch (error) {
    console.error('Error clearing draft round:', error);
  }
}
