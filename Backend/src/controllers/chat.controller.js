import { generateResponse, generateChatTitle } from "../services/ai.service.js";
import chatModel from "../model/chat.model.js";
import messageModel from "../model/message.model.js";

export async function sendMessage(req, res) {
  try {
    const { message } = req.body;

    const text = message?.message;
    let chatId = message?.chatId;

    if (!text) {
      return res.status(400).json({ message: "Message is required" });
    }

    let title = null;
    let chat = null;

    // create new chat if not exists
    if (!chatId) {
      title = await generateChatTitle(text);
      chat = await chatModel.create({
        user: req.user.id,
        title,
      });

      chatId = chat._id;
    }

    // save user message
    await messageModel.create({
      chat: chatId,
      content: text,
      role: "user",
    });

    // get all messages in correct order
    const messages = await messageModel
      .find({ chat: chatId })
      .sort({ createdAt: 1 })
      .limit(10);

    let result;

    try {
      result = await generateResponse(messages);
    } catch (error) {
      console.log("AI Error:", error.message);
      result = "⚠️ AI failed, please try again.";
    }

    // save AI message
    const aiMessage = await messageModel.create({
      chat: chatId,
      content: result,
      role: "ai",
    });

    res.status(201).json({
      title,
      chat,
      aiMessage,
    });
  } catch (error) {
    console.log("Server Error:", error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function getChats(req, res) {
  const user = req.user;

  const chats = await chatModel.find({ user: user.id }).sort({ createdAt: -1 });

  res.status(200).json({
    message: "Chats retrieved successfully",
    chats,
  });
}

export async function getMessages(req, res) {
  const { chatId } = req.params;

  const chat = await chatModel.findOne({
    _id: chatId,
    user: req.user.id,
  });

  if (!chat) {
    return res.status(404).json({
      message: "Chat not found",
    });
  }

  // load only 10 messages on first render
  const messages = await messageModel
    .find({ chat: chatId })
    .sort({ createdAt: -1 })
    .limit(10);

  res.status(200).json({
    message: "Messages retrieved successfully",
    messages: messages.reverse(),
  });
}

export async function deleteChat(req, res) {
  const { chatId } = req.params;

  const chat = await chatModel.findOneAndDelete({
    _id: chatId,
    user: req.user.id,
  });

  await messageModel.deleteMany({
    chat: chatId,
  });

  if (!chat) {
    return res.status(404).json({
      message: "Chat not found",
    });
  }

  res.status(200).json({
    message: "Chat deleted successfully",
  });
}
