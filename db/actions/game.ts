import {
  deleteAllGames,
  deleteGame,
  Game,
  insertGame,
  NewGame,
} from '@/db/querys/game';
import {
  getPlayerByNameAndGame,
  insertPlayer,
  insertPlayers,
} from '../querys/player';

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

export async function removeAllGames() {
  try {
    await deleteAllGames();
  } catch (error) {
    console.error('Error removing all games:', error);
  }
}

export async function addPlayerToGame(gameId: number, playerName: string) {
  try {
    // Check if a player with the same name already exists in this game
    const existingPlayer = await getPlayerByNameAndGame(gameId, playerName);

    if (existingPlayer) {
      // Return the existing player instead of creating a new one
      return existingPlayer;
    }

    // Create a new player if no existing player found
    const player = await insertPlayer({
      gameId,
      name: playerName,
    });

    if (player === undefined) {
      throw new Error('Failed to create player');
    }

    return player;
  } catch (error) {
    console.error('Error adding player to game:', error);
  }
}
