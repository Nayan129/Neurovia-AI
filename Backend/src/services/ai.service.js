import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage } from "langchain";

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
});

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

export async function generateResponse(message) {
  const response = await geminiModel.invoke([new HumanMessage(message)]);

  return response.text;
}

export async function generateChatTitle(message) {
  const response = await mistralModel.invoke([
    new SystemMessage(`
      You are a helpful assistant that generates concise and descriptive titles for vhat conversations.

      User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2 to 4 words. the title should be clear. relevant , and engaging, giving users a quick understanding of the chat's topic.
      `),
    new HumanMessage(`
        Generate a title for chat conversation bases on the following first message:"${message}"
        `),
  ]);

  return response.text;
}
