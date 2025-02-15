import { WebSocketServer } from "ws";

export const wss = new WebSocketServer({ port: 8080 });

wss.on("close", () => {
  console.log("Connection closed !");
});
