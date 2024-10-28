import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { messageHandler } from "../messageHandler/messageHandler";

const clients = new Map<string, WebSocket>();
let clientIds = 0;

export function startWebSocketServer(port: number) {
  const wss = new WebSocketServer({ port });
  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const clientId = (clientIds++).toString();
    clients.set(clientId, ws);
    console.log(`Client has connected: ${clientId}`);

    ws.on("message", (message: string) => {
      console.log(`Received message from ${clientId}: ${message}`);
      messageHandler(ws, message, clientId);
    });

    ws.on("close", () => {
      console.log(`Client has disconnected: ${clientId}`);
      clients.delete(clientId);
    });
  });

  console.log(`WebSocket-Server started on ws://localhost:${port}`);
}
