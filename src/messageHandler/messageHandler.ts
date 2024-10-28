import { WebSocket } from "ws";
import { handleRegistration } from "../cntrollers/player";
import { Message, sendError } from "../helpers";
import { handleAddUser, handleCreateRoom } from "../cntrollers/room";
import { handleAddShips, handleAttack } from "../cntrollers/game";

export const messageHandler = (
  ws: WebSocket,
  message: string,
  clientId: string
) => {
  try {
    const { type, data } = JSON.parse(message);

    if (type === "reg") {
      handleRegistration(ws, data, clientId);
    } else if (type === "create_room") {
      handleCreateRoom(ws, clientId);
    } else if (type === "add_user_to_room") {
      handleAddUser(ws, data, clientId);
    } else if (type === "add_user_to_room") {
      handleAddUser(ws, data, clientId);
    } else if (type === "add_ships") {
      handleAddShips(ws, data);
    } else if (type === "attack") {
      handleAttack(ws, data);
    } else {
      sendError(ws, "Unknown type f message");
    }
  } catch (error) {
    console.error("Error while handling message:", error);
  }
};
