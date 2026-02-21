import express from "express";
import { Server } from "http";
import { AppDataSource } from "./db";
import { env } from "./config";
import { matchRouter } from "./routes/matches";
import { attachWebSocketServer, wss } from "./ws";

let server: Server | undefined = undefined;

async function startServer() {
  try {
    console.log("Connecting to database");
    await AppDataSource.initialize();
    console.log("Connected to database successfully");

    const app = express();

    app.use("/matches", express.json(), matchRouter);

    server = app.listen(env.PORT, () => {
      const host =
        env.HOST === "0.0.0.0"
          ? `http://localhost:${env.PORT}`
          : `http://${env.HOST}:${env.PORT}`;
      console.log(`HTTP server is ready to accept requests: ${host}`);
    });

    attachWebSocketServer(server);
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
}

async function shutdown(signal: NodeJS.Signals) {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  try {
    // 1. Stop the wss server
    if (wss) {
      const _wss = wss;
      await new Promise<void>((resolve, reject) => {
        _wss.close((err) => {
          if (err) return reject(err);
          console.log("WSS closed.");
          resolve();
        });
      });
    }
    // 2. Stop the server from accepting new connections
    if (server) {
      const _server = server;
      await new Promise<void>((resolve, reject) => {
        _server.close((err) => {
          if (err) return reject(err);
          console.log("HTTP server closed.");
          resolve();
        });
      });
    }

    // 2. Close the database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("Database connection closed.");
    }

    console.log("Graceful shutdown complete. Exiting.");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
}

process.on("SIGINT", (signal) => shutdown(signal));
process.on("SIGTERM", (signal) => shutdown(signal));

startServer();
