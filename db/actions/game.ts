import { deleteGame, Game, insertGame, NewGame } from '@/db/querys/game';
import { insertPlayers } from '../querys/player';

export async function addNewGame(newGame: NewGame, playersNames: string[]) {
  try {
    const game = await insertGame(newGame);

    if (game === undefined) {
      throw new Error('Failed to create a new game');
    }

    const playerValues = playersNames.map((name) => ({
      gameId: game.id,
      name,
    }));

    const players = await insertPlayers(playerValues);
    if (players === undefined) {
      throw new Error('Failed to create players');
    }

    return { game, players };
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
