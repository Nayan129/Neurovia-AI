import { io } from "socket.io-client";

export const initializeSocketConnection = () => {
  const socket = io("https://neurovia-ai-evzk.onrender.com", {
    transports: ["websocket"], 
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("connected to socket.io server");
  });

  socket.on("connect_error", (err) => {
    console.log("Socket error:", err.message);
  });

  return socket;
};
