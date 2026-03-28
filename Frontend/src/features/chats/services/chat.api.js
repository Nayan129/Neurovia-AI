import axios from "axios";

const api = axios.create({
  baseURL: "https://neurovia-ai-evzk.onrender.com",
  withCredentials: true,
  timeout: 60000,
});

export const sendMessage = async ({ message, chatId }) => {
  const response = await api.post("/api/chats/message", {
    message: {
      message,
      chatId,
    },
  });

  return response.data;
};

export const getChats = async () => {
  const response = await api.get("/api/chats");
  return response.data;
};

export const getMessages = async (chatId) => {
  const response = await api.get(`/api/chats/${chatId}/messages`);
  return response.data;
};

export const deleteChat = async (chatId) => {
  const response = await api.delete(`/api/chats/delete/${chatId}`);
  return response.data;
};
