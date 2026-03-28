import { initializeSocketConnection } from "../services/chat.socket.js";
import {
  sendMessage,
  getChats,
  getMessages,
  deleteChat,
} from "../services/chat.api.js";
import {
  setChats,
  setCurrentChatId,
  setError,
  setLoading,
  createNewChat,
  addNewMessage,
  addMessages,
  removeChat,
} from "../chat.slice";
import { useDispatch, useSelector } from "react-redux";

export const useChat = () => {
  const dispatch = useDispatch();

  const { currentChatId, isLoading } = useSelector((state) => state.chat);

  // SEND MESSAGE
  const handleSendMessage = async ({ message, chatId }) => {
    const trimmed = message?.trim();
    if (!trimmed || isLoading) return;

    try {
      dispatch(setLoading(true));

      const data = await sendMessage({
        message: trimmed,
        chatId,
      });

      const { chat, aiMessage } = data;
      const finalChatId = chatId || chat?._id;

      if (!chatId && chat) {
        dispatch(
          createNewChat({
            chatId: chat._id,
            title: chat.title,
          }),
        );
      }

      dispatch(setCurrentChatId(finalChatId));

      dispatch(
        addNewMessage({
          chatId: finalChatId,
          content: trimmed,
          role: "user",
        }),
      );

      if (aiMessage?.content) {
        dispatch(
          addNewMessage({
            chatId: finalChatId,
            content: aiMessage.content,
            role: aiMessage.role,
          }),
        );
      }
    } catch (err) {
      console.error("Send Message Error:", err);
      dispatch(setError("Failed to send message"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // GET ALL CHATS

  const handleGetChats = async () => {
    try {
      dispatch(setLoading(true));

      const data = await getChats();
      const { chats } = data;

      const formatted = chats.reduce((acc, chat) => {
        acc[chat._id] = {
          id: chat._id,
          title: chat.title,
          messages: [],
          lastUpdated: chat.updatedAt,
        };
        return acc;
      }, {});

      dispatch(setChats(formatted));
    } catch (err) {
      console.error("Get Chats Error:", err);
      dispatch(setError("Failed to load chats"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // OPEN CHAT

  const handleOpenChat = async (chatId, chats) => {
    try {
      if (!chatId) return;

      // already loaded → skip API
      if (chats[chatId]?.messages?.length > 0) {
        dispatch(setCurrentChatId(chatId));
        return;
      }

      const data = await getMessages(chatId);
      const { messages } = data;

      localStorage.setItem("currentChatId", chatId);

      const formattedMessages = messages.map((msg) => ({
        content: msg.content,
        role: msg.role,
      }));

      dispatch(
        addMessages({
          chatId,
          messages: formattedMessages,
        }),
      );

      dispatch(setCurrentChatId(chatId));
    } catch (err) {
      console.error("Open Chat Error:", err);
      dispatch(setError("Failed to load messages"));
    }
  };

  // NEW CHAT

  const handleNewChat = () => {
    dispatch(setCurrentChatId(null));
    localStorage.removeItem("currentChatId");
  };

  // DELETE CHAT

  const handleDeleteChat = async (chatId) => {
    try {
      if (!chatId) return;

      await deleteChat(chatId);
      dispatch(removeChat(chatId));

      if (currentChatId === chatId) {
        dispatch(setCurrentChatId(null));
      }
    } catch (err) {
      console.error("Delete Chat Error:", err);
      dispatch(setError("Failed to delete chat"));
    }
  };

  return {
    initializeSocketConnection,
    handleSendMessage,
    handleGetChats,
    handleOpenChat,
    handleNewChat,
    handleDeleteChat,
  };
};
