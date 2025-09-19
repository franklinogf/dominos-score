import { db } from '../database';
import { playersTable } from '../schema';

export type NewPlayer = typeof playersTable.$inferInsert;

export async function insertPlayers(players: NewPlayer[]) {
  try {
    const result = await db.insert(playersTable).values(players).returning();
    console.log('Inserted new player with ID:', result);
    return result;
  } catch (error) {
    console.error('Database error inserting player:', error);
  }
}
