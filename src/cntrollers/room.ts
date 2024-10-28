import { WebSocket } from "ws";
import { Room } from "../classes/room";
import { rooms } from "../db/db";
import { sendMessage } from "../helpers";

export function initNewRoom(): Room {
  const lastRoomId =
    rooms.size > 0
      ? Math.max(...Array.from(rooms.keys()).map((roomId) => parseInt(roomId)))
      : -1;
  const room = new Room((lastRoomId + 1).toString());
  rooms.set(room.roomId, room);
  return room;
}

export function handleCreateRoom(ws: WebSocket, clientId: string) {
  const room = initNewRoom();
  room.players.push(clientId);
}

export function handleAddUser(ws: WebSocket, data: any, clientId: string) {
  const { indexRoom } = JSON.parse(data);
  const room = rooms.get(indexRoom);
  if (room && room.players.length < 2) {
    room.players.push(clientId);
  } else {
    sendMessage(ws, {
      type: "error",
      data: { errorText: "Cannot get access room" },
      id: 0,
    });
  }
}
