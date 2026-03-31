import { io } from "socket.io-client";
import { API_ORIGIN } from "../config/runtime";

const SOCKET_URL = API_ORIGIN || undefined;

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket", "polling"],
  path: "/socket.io",
});
