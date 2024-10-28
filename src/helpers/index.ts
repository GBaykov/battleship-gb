import { WebSocket } from "ws";

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
