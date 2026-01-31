import { db } from '@/db/database';
import { gamesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type NewGame = typeof gamesTable.$inferInsert;
export type Game = typeof gamesTable.$inferSelect;

export async function insertGame(game: NewGame) {
  try {
    const result = await db.insert(gamesTable).values(game).returning();
    return result[0];
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

export async function deleteAllGames() {
  try {
    await db.delete(gamesTable);
  } catch (error) {
    console.error('Database error deleting all games:', error);
  }
}

export async function getAllGames() {
  try {
    const games = await db.query.gamesTable.findMany({
      orderBy: (gamesTable, { desc }) => [desc(gamesTable.createdAt)],
      with: { rounds: true },
    });

    return games;
  } catch (error) {
    console.error('Database error fetching games:', error);
    return [];
  }
}

export async function getGameById(gameId: Game['id']) {
  try {
    const game = await db.query.gamesTable.findFirst({
      where: eq(gamesTable.id, gameId),
      with: {
        rounds: {
          with: {
            playersToRounds: {
              with: { player: true },
            },
          },
        },
        players: true,
      },
    });
    return game || null;
  } catch (error) {
    console.error('Database error fetching game by ID:', error);
    return null;
  }
}

export type GameWithRounds = Awaited<ReturnType<typeof getAllGames>>[number];
export type GameWithRoundsAndPlayers = Awaited<ReturnType<typeof getGameById>>;
