import { WebSocket } from "ws";
import { Game } from "../classes/games";
import { games, players } from "../db/db";
import {
  gameMessage,
  getShipCells,
  getSurroundingCells,
  isKilled,
  sendMessage,
} from "../helpers";
export const gameTimers = new Map<string, NodeJS.Timeout>();

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

export function handleAddShips(ws: WebSocket, data: any) {
  const { gameId, ships, indexPlayer } = JSON.parse(data);
  console.log("handleAddShips", indexPlayer, gameId, ships);
  const game = games.get(gameId);

  if (game && game.players[indexPlayer]) {
    game.players[indexPlayer].ships = ships;

    const allPlayersReady = Object.values(game.players).every(
      (p) => p.ships.length > 0
    );
    if (allPlayersReady) {
      sendStartGame(game);
      //   sendTurnMessage(game);
    } else {
      console.log("Waiting for other player to add ships", game.players);
    }
  } else {
    console.log("Game not found or player not in game");
  }
}

export const sendStartGame = (game: Game) => {
  for (const clientId in game.players) {
    const player = players.get(clientId);
    if (player) {
      const message = {
        type: "start_game",
        data: {
          ships: game.players[clientId].ships,
          currentPlayerIndex: clientId,
        },
        id: 0,
      };
      if (player.ws) sendMessage(player.ws, message);
    }
  }
};
export function handleAttack(ws: WebSocket, data: any) {
  const { gameId, x, y, indexPlayer } = JSON.parse(data);
  const game = games.get(gameId);

  if (!game || game.currentTurn !== indexPlayer) {
    console.log("Invalid turn or game not found");
    return;
  }

  clearTimeout(gameTimers.get(gameId)!);
  gameTimers.delete(gameId);

  if (game && game.currentTurn === indexPlayer) {
    const opponentId = Object.keys(game.players).find(
      (id) => id !== indexPlayer
    )!;
    const opponentData = game.players[opponentId];

    const hitShip = opponentData.ships.find((ship) => {
      const cells = getShipCells(ship);
      return cells.some((cell) => cell.x === x && cell.y === y);
    });

    let status: "miss" | "shot" | "killed" = "miss";
    if (hitShip) {
      if (
        !opponentData.shotsReceived.some((shot) => shot.x === x && shot.y === y)
      ) {
        opponentData.shotsReceived.push({ x, y });
      }
      const isShipKilled = isKilled(hitShip, opponentData.shotsReceived);
      status = isShipKilled ? "killed" : "shot";

      if (isShipKilled) {
        const surroundingCells = getSurroundingCells(hitShip);
        surroundingCells.forEach((cell) => {
          if (
            cell.x >= 0 &&
            cell.y >= 0 &&
            !opponentData.shotsReceived.some(
              (shot) => shot.x === cell.x && shot.y === cell.y
            ) &&
            !opponentData.ships.some((ship) => {
              const cells = getShipCells(ship);
              return cells.some((cell) => cell.x === x && cell.y === y);
            })
          ) {
            opponentData.shotsReceived.push(cell);
            const missMessage = {
              type: "attack",
              data: {
                position: { x: cell.x, y: cell.y },
                currentPlayer: indexPlayer,
                status: "miss",
              },
              id: 0,
            };
            gameMessage(game, missMessage);
          }
        });
      }

      if (isPlayerDefeated(opponentData)) {
        const message = {
          type: "finish",
          data: {
            winPlayer: indexPlayer,
          },
          id: 0,
        };
        gameMessage(game, message);
        updatePlayerWin(indexPlayer);
        return;
      }
    }

    const attackMessage = {
      type: "attack",
      data: {
        position: { x, y },
        currentPlayer: indexPlayer,
        status,
      },
      id: 0,
    };

    gameMessage(game, attackMessage);

    if (status === "miss") {
      game.currentTurn = opponentId;
    }
    const message = {
      type: "turn",
      data: {
        currentPlayer: game.currentTurn,
      },
      id: 0,
    };

    gameMessage(game, message);
  } else {
    console.log("Invalid turn or game not found");
  }
}

export function isPlayerDefeated(playerData: any): boolean {
  for (const ship of playerData.ships) {
    if (!isKilled(ship, playerData.shotsReceived)) {
      return false;
    }
  }
  return true;
}
export function updatePlayerWin(clientId: string) {
  const player = players.get(clientId);
  if (player) {
    player.wins += 1;
    sendUpdateWinners();
  }
}

export function sendUpdateWinners() {
  const winnerList = Array.from(players.values())
    .filter((p) => !p.name.startsWith("Bot"))
    .map((p) => ({ name: p.name, wins: p.wins }));

  const message = {
    type: "update_winners",
    data: winnerList.sort((a, b) => b.wins - a.wins),
    id: 0,
  };
  for (const player of players.values()) {
    console.log("message", message, player.name);
    player.ws?.send(
      JSON.stringify({ ...message, data: JSON.stringify(message.data) })
    );
  }
}
