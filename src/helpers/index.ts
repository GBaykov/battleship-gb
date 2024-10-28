import { WebSocket } from "ws";
import { Ship } from "../types/types";
import { players } from "../db/db";
import { Game } from "../classes/games";

export type Message = {
  type: string;
  id: number;
  data: any;
};

export function sendMessage(ws: WebSocket, message: Message) {
  console.log("sendMessage", message);
  ws.send(JSON.stringify({ ...message, data: JSON.stringify(message.data) }));
}

export function sendError(ws: WebSocket, errorText: string) {
  sendMessage(ws, { type: "error", data: { errorText }, id: 0 });
}

export const getShipCells = (ship: Ship): { x: number; y: number }[] => {
  const cells = [];
  for (let i = 0; i < ship.length; i++) {
    const x = ship.direction ? ship.position.x : ship.position.x + i;
    const y = ship.direction ? ship.position.y + i : ship.position.y;
    cells.push({ x, y });
  }
  return cells;
};

export const isKilled = (
  ship: Ship,
  shotsReceived: { x: number; y: number }[]
) => {
  const shipCells = getShipCells(ship);
  return shipCells.every((cell) =>
    shotsReceived.some((shot) => shot.x === cell.x && shot.y === cell.y)
  );
};

export const surroundins = (x: number, y: number) => {
  return [
    { x: x + 1, y: y - 1 },
    { x: x + 1, y: y + 1 },
    { x: x + 1, y: y },
    { x: x, y: y + 1 },
    { x: x, y: y - 1 },
    { x: x - 1, y: y },
    { x: x - 1, y: y + 1 },
    { x: x - 1, y: y - 1 },
  ];
};

export const getSurroundingCells = (ship: Ship) => {
  const surroundingCells = [];
  for (const coord of getShipCells(ship)) {
    surroundingCells.push(...surroundins(coord.x, coord.y));
  }
  return surroundingCells;
};

export const gameMessage = (game: Game, message: Message) => {
  for (const clientId in game.players) {
    const player = players.get(clientId);
    if (player) {
      player.ws?.send(
        JSON.stringify({ ...message, data: JSON.stringify(message.data) })
      );
    }
  }
};
