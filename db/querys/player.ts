import { and, eq, sql } from 'drizzle-orm';
import { db } from '../database';
import { playersTable } from '../schema';

export type NewPlayer = typeof playersTable.$inferInsert;
export type PlayerSelect = typeof playersTable.$inferSelect;

export async function getPlayerByNameAndGame(gameId: number, name: string) {
  try {
    const normalizedName = name.trim().toLowerCase();
    const result = await db
      .select()
      .from(playersTable)
      .where(
        and(
          eq(playersTable.gameId, gameId),
          sql`LOWER(TRIM(${playersTable.name})) = ${normalizedName}`,
        ),
      )
      .limit(1);
    return result[0];
  } catch (error) {
    console.error('Database error finding player:', error);
  }
}

export async function insertPlayers(players: NewPlayer[]) {
  try {
    const result = await db.insert(playersTable).values(players).returning();
    return result;
  } catch (error) {
    console.error('Database error inserting player:', error);
  }
}

export async function insertPlayer(player: NewPlayer) {
  try {
    const result = await db.insert(playersTable).values(player).returning();
    return result[0];
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

export async function incrementPlayerLosses(
  playerId: PlayerSelect['id'],
  incrementBy: number = 1,
) {
  try {
    await db
      .update(playersTable)
      .set({ losses: sql`${playersTable.losses} + ${incrementBy}` })
      .where(eq(playersTable.id, playerId));
  } catch (error) {
    console.error('Database error incrementing player losses:', error);
  }
}
