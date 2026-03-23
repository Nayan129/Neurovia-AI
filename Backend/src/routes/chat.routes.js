import { Router } from "express";
import {
  sendMessage,
  getChats,
  getMessages,
} from "../controllers/chat.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";

const chatRouter = Router();

chatRouter.post("/message", authUser, sendMessage);

chatRouter.get("/", authUser, getChats);

chatRouter.get("/:chatId/messages", authUser, getMessages);

export default chatRouter;
