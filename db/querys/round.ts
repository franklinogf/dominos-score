import { db } from '@/db/database';
import { playersToRoundsTable, roundsTable } from '@/db/schema';
import { and, desc, eq, isNull } from 'drizzle-orm';

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

export async function getLatestDraftRound(gameId: number) {
  try {
    const round = await db.query.roundsTable.findFirst({
      where: and(
        eq(roundsTable.gameId, gameId),
        isNull(roundsTable.roundWinnerId),
      ),
      orderBy: [desc(roundsTable.id)],
      with: {
        playersToRounds: {
          with: { player: true },
        },
      },
    });
    return round ?? null;
  } catch (error) {
    console.error('Database error fetching draft round:', error);
    return null;
  }
}

export async function getOrCreateDraftRound(gameId: number) {
  try {
    const existingRound = await getLatestDraftRound(gameId);
    if (existingRound) return existingRound.id;

    const result = await insertRound({ gameId });
    return result?.[0]?.insertedId;
  } catch (error) {
    console.error('Database error creating draft round:', error);
  }
}

export async function upsertPlayerDraftScores(
  roundId: number,
  playerId: number,
  scores: string[],
) {
  try {
    await db
      .insert(playersToRoundsTable)
      .values({ roundId, playerId, scores })
      .onConflictDoUpdate({
        target: [playersToRoundsTable.playerId, playersToRoundsTable.roundId],
        set: { scores },
      });
  } catch (error) {
    console.error('Database error upserting player draft scores:', error);
  }
}

export async function deletePlayerDraftScores(roundId: number, playerId: number) {
  try {
    await db
      .delete(playersToRoundsTable)
      .where(
        and(
          eq(playersToRoundsTable.roundId, roundId),
          eq(playersToRoundsTable.playerId, playerId),
        ),
      );
  } catch (error) {
    console.error('Database error deleting player draft scores:', error);
  }
}

export async function clearDraftRoundScores(roundId: number) {
  try {
    await db
      .delete(playersToRoundsTable)
      .where(eq(playersToRoundsTable.roundId, roundId));
  } catch (error) {
    console.error('Database error clearing draft round scores:', error);
  }
}

export async function updateRoundWinner(roundId: number, winnerPlayerId: number) {
  try {
    await db
      .update(roundsTable)
      .set({ roundWinnerId: winnerPlayerId })
      .where(eq(roundsTable.id, roundId));
  } catch (error) {
    console.error('Database error updating round winner:', error);
  }
}
