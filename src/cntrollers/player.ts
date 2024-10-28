import { WebSocket } from "ws";
import { Player } from "../classes/player";
import { players } from "../db/db";

export function handleRegistration(ws: WebSocket, data: any, clientId: string) {
  const { name, password } = JSON.parse(data);

  console.log("handleRegistration", name, password, data, players.keys());
  let player = Array.from(players.values()).find(
    (player) => player.name === name
  );

  if (player) {
    if (player.password !== password) {
      const messageData = {
        type: "reg",
        data: {
          name,
          index: clientId,
          error: true,
          errorText: "Invalid password",
        },
        id: 0,
      };

      ws.send(
        JSON.stringify({
          ...messageData,
          data: JSON.stringify(messageData.data),
        })
      );
      return;
    }
    player.ws = ws;
    player.clientId = clientId;
  } else {
    player = new Player(name, password, clientId, ws);
    players.set(clientId, player);
  }

  const messageData = {
    type: "reg",
    data: {
      name,
      index: clientId,
      error: false,
      errorText: "",
    },
    id: 0,
  };

  ws.send(
    JSON.stringify({
      ...messageData,
      data: JSON.stringify(messageData.data),
    })
  );
}
