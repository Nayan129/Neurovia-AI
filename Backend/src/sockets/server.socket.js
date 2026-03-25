import { Server } from "socket.io";

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  console.log("socket.io is running");

  io.on("connection", (socket) => {
    console.log("A user connected: " + socket.id);
  });
}

export function getIo() {
  if (!io) {
    throw new error("socket.io not initialized");
  }
  return io;
}
