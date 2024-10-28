import { Game } from "../classes/games";
import { games } from "../db/db";

export const initNewGame = (playerIds: string[]) => {
  const lastGameId =
    games.size > 0
      ? Math.max(...Array.from(games.keys()).map((gameId) => parseInt(gameId)))
      : -1;
  const gameId = (lastGameId + 1).toString();
  const game = new Game(gameId, playerIds);
  games.set(gameId, game);
  console.log("Has created new Game", game);
  return game;
};
