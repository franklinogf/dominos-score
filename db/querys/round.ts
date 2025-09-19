import { db } from '@/db/database';
import { playersToRoundsTable, roundsTable } from '@/db/schema';

export type NewRound = typeof roundsTable.$inferInsert;

export async function insertRound(round: NewRound) {
  try {
    const result = await db
      .insert(roundsTable)
      .values(round)
      .returning({ insertedId: roundsTable.id });
    return result;
  } catch (error) {
    console.error('Database error inserting round:', error);
  }
}

export async function insertPlayerToRound(
  roundId: number,
  playerId: number,
  playerScore: string[],
) {
  try {
    await db
      .insert(playersToRoundsTable)
      .values({ roundId, playerId, scores: playerScore });
  } catch (error) {
    console.error('Database error inserting player to round:', error);
  }
}
