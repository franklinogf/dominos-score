import { deleteGame, Game, insertGame, NewGame } from '@/db/querys/game';
import { useGame } from '@/stores/use-game';

export async function addNewGame(newGame: NewGame) {
  try {
    const result = await insertGame(newGame);
    const gameId = result?.[0].insertedId;

    if (gameId === undefined) {
      throw new Error('Failed to retrieve inserted game ID');
    }

    useGame.getState().updateCurrentGameId(gameId);

    return gameId;
  } catch (error) {
    console.error('Error adding new game:', error);
  }
}

export async function removeGame(gameId: Game['id']) {
  try {
    await deleteGame(gameId);
  } catch (error) {
    console.error('Error removing game:', error);
  }
}
