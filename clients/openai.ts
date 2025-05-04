import OpenAI from "openai"

import { contextModel } from "~models/ContextModel"
import { OPENAI_API_KEY } from "~utils/storageKeys"

let openai: OpenAI | null = null

export function getOpenAIClient(apiKey: string) {
  if (!openai) {
    openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })
  }
  return openai
}

export async function callOpenAIAPI(message: string) {
  const { openaiKey } = await chrome.storage.local.get(OPENAI_API_KEY)
  if (!openaiKey || typeof openaiKey !== "string") {
    throw new Error("No API key found")
  }

  const context = await contextModel.safeGetContext()
  const contextText = context.map((item) => item.text).join("\n\n")

  const client = getOpenAIClient(openaiKey)
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful in-browser assistant that can answer questions about the context provided, but also generalize when the context is not relevant to the user's query."
      },
      {
        role: "user",
        content: message + "\n\nContext: \n\n" + contextText
      }
    ],
    max_tokens: 1024
  })
  return response.choices[0].message.content
}
