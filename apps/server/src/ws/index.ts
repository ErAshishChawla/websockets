import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { Match } from "../entity/Match";
import { env } from "../config";

let wss: WebSocketServer | undefined = undefined;

function sendJson(socket: WebSocket, payload: unknown) {
  const data = JSON.stringify(payload);
  if (socket.readyState !== WebSocket.OPEN) {
    return;
  }

  socket.send(data, (err) => {
    if (err) console.error("Web socket send failed:", err);
  });
}

function broadcast(wss: WebSocketServer, payload: unknown) {
  const data = JSON.stringify(payload);

  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) {
      continue;
    }

    client.send(data, (err) => {
      if (err) console.error("Web socket broadcast failed:", err);
    });
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
