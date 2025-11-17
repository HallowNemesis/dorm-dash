import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL ??
  "https://dawn-youthful-disrespectfully.ngrok-free.dev";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
