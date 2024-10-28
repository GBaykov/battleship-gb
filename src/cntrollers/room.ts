import { WebSocket } from "ws";
import { Room } from "../classes/room";
import { players, rooms } from "../db/db";
import { Message, sendMessage } from "../helpers";
import { initNewGame } from "./game";

export const updateRoom = () => {
  const filtered_rooms = Array.from(rooms.values()).filter(
    (room) => room.players.length === 1
  );
  const roomList = filtered_rooms.map((room) => ({
    roomId: room.roomId,
    roomUsers: room.players.map((clientId) => {
      const player = players.get(clientId);
      return {
        name: player?.name,
        index: clientId,
      };
    }),
  }));

  const message: Message = {
    type: "update_room",
    data: roomList,
    id: 0,
  };
  for (const player of players.values()) {
    player.ws?.send(
      JSON.stringify({ ...message, data: JSON.stringify(message.data) })
    );
  }
};

export const startGame = (room: Room) => {
  room.gameStarted = true;

  const game = initNewGame(room.players);
  const [player1Id, player2Id] = room.players;
  const player1 = players.get(player1Id);
  const player2 = players.get(player2Id);

  const message = {
    type: "create_game",
    data: {
      idGame: game.idGame,
      idPlayer: player1Id,
    },
    id: 0,
  };
  if (player1?.ws) {
    sendMessage(player1.ws, message);
  }
  if (player2?.ws) {
    sendMessage(player2.ws, message);
  }
  message.data.idPlayer = player2Id;
};

export const initNewRoom = (): Room => {
  const lastRoomId =
    rooms.size > 0
      ? Math.max(...Array.from(rooms.keys()).map((roomId) => parseInt(roomId)))
      : -1;
  const room = new Room((lastRoomId + 1).toString());
  rooms.set(room.roomId, room);
  return room;
};

export const handleCreateRoom = (ws: WebSocket, clientId: string) => {
  const room = initNewRoom();
  room.players.push(clientId);
  updateRoom();
};

export const handleAddUser = (ws: WebSocket, data: any, clientId: string) => {
  const { indexRoom } = JSON.parse(data);
  const room = rooms.get(indexRoom);
  if (room && room.players.length < 2) {
    room.players.push(clientId);
    updateRoom();
    startGame(room);
  } else {
    sendMessage(ws, {
      type: "error",
      data: { errorText: "Cannot get access to room" },
      id: 0,
    });
  }
};
