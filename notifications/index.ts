import { WebSocketServer as WSServer } from "ws";
import { createServer } from "http";
import MongoDB from "./models/mongodb.js";
import app from "./app.js";
import { onConnection } from "./lib/web-socket-handlers.js";
import { loadEnvVars } from "./utilities.js";

loadEnvVars();

const port = process.env.PORT;
const http = createServer();
const wss = new WSServer({
  server: http,
});

http.on("request", app);

http.on("close", async () => {
  const { client } = await MongoDB.getInstance();

  client.close();
});

wss.on("connection", onConnection);

http.listen(port, () => {
  console.log(`[notifications]: Server is listening on ${port}`);
});
