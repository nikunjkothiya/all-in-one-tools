import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

let io;

const initializeSocket = (app) => {
  const server = http.createServer(app);

  io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
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
