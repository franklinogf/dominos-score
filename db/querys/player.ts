import { eq, sql } from 'drizzle-orm';
import { db } from '../database';
import { playersTable } from '../schema';

export type NewPlayer = typeof playersTable.$inferInsert;
export type PlayerSelect = typeof playersTable.$inferSelect;

export async function insertPlayers(players: NewPlayer[]) {
  try {
    const result = await db.insert(playersTable).values(players).returning();
    console.log('Inserted new player with ID:', result);
    return result;
  } catch (error) {
    console.error('Database error inserting player:', error);
  }
}

export async function incrementPlayerWins(playerId: PlayerSelect['id']) {
  try {
    await db
      .update(playersTable)
      .set({ wins: sql`${playersTable.wins} + 1` })
      .where(eq(playersTable.id, playerId));
  } catch (error) {
    console.error('Database error incrementing player wins:', error);
  }
}

export async function incrementPlayerLosses(playerId: PlayerSelect['id']) {
  try {
    await db
      .update(playersTable)
      .set({ losses: sql`${playersTable.losses} + 1` })
      .where(eq(playersTable.id, playerId));
  } catch (error) {
    console.error('Database error incrementing player losses:', error);
  }
}
