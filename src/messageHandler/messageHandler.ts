import { WebSocket } from "ws";
import { handleRegistration } from "../cntrollers/player";
import { Message, sendError } from "../helpers";
import { handleAddUser, handleCreateRoom } from "../cntrollers/room";

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
    } else {
      sendError(ws, "Unknown type f message");
    }
  } catch (error) {
    console.error("Error handling message:", error);
    //   sendError(ws, 'Invalid message format');
  }
};
