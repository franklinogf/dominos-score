import { db } from '@/db/database';
import { gamesTable, roundsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type NewGame = typeof gamesTable.$inferInsert;
export type Game = typeof gamesTable.$inferSelect;
export interface GameWithRounds extends Game {
  roundCount: number;
}

export async function insertGame(game: NewGame) {
  try {
    const result = await db
      .insert(gamesTable)
      .values(game)
      .returning({ insertedId: gamesTable.id });
    console.log('Inserted new game with ID:', result);
    return result;
  } catch (error) {
    console.error('Database error inserting game:', error);
  }
}

export async function deleteGame(gameId: Game['id']) {
  try {
    await db.delete(gamesTable).where(eq(gamesTable.id, gameId));
  } catch (error) {
    console.error('Database error deleting game:', error);
  }
}

export async function getAllGames() {
  try {
    const games = await db.query.gamesTable.findMany({
      orderBy: (gamesTable, { desc }) => [desc(gamesTable.createdAt)],
      extras: {
        roundCount: db.$count(roundsTable).as('roundCount'),
      },
    });

    return games;
  } catch (error) {
    console.error('Database error fetching games:', error);
    return [];
  }
}
