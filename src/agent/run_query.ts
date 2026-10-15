import { GoogleGenAI } from "@google/genai";
import chalk from "chalk";
import { handleMessage, MessageHandlerOptions } from "./message_handler.js";

const ai = new GoogleGenAI();

export async function runQuery(
  prompt: string,
  options: MessageHandlerOptions = {},
) {
  try {
    const { verbose = false } = options;
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful code assistant.",
        temperature: 0.2,
      },
    });

    for await (const chunk of responseStream) {
      handleMessage(chunk, { verbose });
    }
    console.log();
  } catch (error) {
    console.error(chalk.red("Error: "), error);
  }
}
