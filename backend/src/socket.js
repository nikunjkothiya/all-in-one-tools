import { Server } from "socket.io";
import http from "http";
import config from "./config/env.js";

let io;

const initializeSocket = (app) => {
  const server = http.createServer(app);

  io = new Server(server, {
    cors: {
      origin: config.corsOrigin,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return { io, server };
};

export { initializeSocket, io };
