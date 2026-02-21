import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { Match } from "../entity/Match";
import { env } from "../config";

let wss: WebSocketServer | undefined = undefined;

function sendJson(socket: WebSocket, payload: unknown) {
  if (socket.readyState !== WebSocket.OPEN) {
    return;
  }

  socket.send(JSON.stringify(payload));
}

function broadcast(wss: WebSocketServer, payload: unknown) {
  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) {
      continue;
    }

    client.send(JSON.stringify(payload));
  }
}

function broadcastMatchCreated(match: Match) {
  if (!wss) {
    return;
  }
  broadcast(wss, { type: "match_created", data: match });
}

function attachWebSocketServer(server: Server) {
  wss = new WebSocketServer({ server, path: "/ws", maxPayload: 1024 * 1024 });

  wss.on("connection", (socket) => {
    sendJson(socket, { type: "welcome" });

    socket.on("error", console.error);
  });

  return wss;
}

export {
  wss,
  sendJson,
  broadcast,
  broadcastMatchCreated,
  attachWebSocketServer,
};
