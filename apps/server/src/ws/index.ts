import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { Match } from "../entity/Match";

/* 
Logic behind ping pong
1. Assume on connection socket is alive
2. Every 30 seconds a function call runs that does the following
    1. if socket is not alive terminate it
    2. If socket is alive mark it unalive and ping it.
3. If pong is received then mark that socket as alive
*/

let wss: WebSocketServer | undefined = undefined;
const isAliveMap = new WeakMap<WebSocket, boolean>();

function sendJson(socket: WebSocket, payload: unknown) {
  if (socket.readyState !== WebSocket.OPEN) {
    return;
  }

  const data = JSON.stringify(payload);

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

  const _wss = wss;

  _wss.on("connection", (socket) => {
    // Mark the socket as alive
    isAliveMap.set(socket, true);

    // Send a welcome message
    sendJson(socket, { type: "welcome" });

    // On Pong mark the socket as isActive
    socket.on("pong", () => {
      isAliveMap.set(socket, true);
    });

    socket.on("error", console.error);
  });

  const interval = setInterval(() => {
    _wss.clients.forEach((ws) => {
      // If not alive terminate
      if (!isAliveMap.get(ws)) {
        return ws.terminate();
      }

      // Set is Alive as false
      isAliveMap.set(ws, false);

      // Ping the socket
      ws.ping();
    });
  }, 30000);

  _wss.on("close", () => {
    clearInterval(interval);
  });

  return wss;
}

function getWSS() {
  return wss;
}

export {
  sendJson,
  broadcast,
  broadcastMatchCreated,
  attachWebSocketServer,
  getWSS,
};
