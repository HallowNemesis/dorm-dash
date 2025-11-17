import { io, Socket } from "socket.io-client";

const SOCKET_URL = "https://dawn-youthful-disrespectfully.ngrok-free.dev"; // NO /api

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, { transports: ["websocket"] });
  }
  return socket;
}
