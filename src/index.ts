import { httpServer } from "./http_server/index.js";

import * as dotenv from "dotenv";
import { startWebSocketServer } from "./wss/server.js";

const HTTP_PORT = 8081;

console.log(`Start static HTTP server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

dotenv.config();
const PORT = process.env.PORT || 3000;
startWebSocketServer(Number(PORT));
