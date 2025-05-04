import OpenAI from "openai"

let openai: OpenAI | null = null

export function getOpenAIClient(apiKey: string) {
  if (!openai) {
    openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })
  }
  return openai
}

export async function callOpenAIAPI(
  message: string,
  context: string,
  apiKey: string
) {
  const client = getOpenAIClient(apiKey)
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful in-browser assistant that can answer questions about the context provided, but also generalize when the context is not relevant to the user's query."
      },
      { role: "user", content: message + "\n\nContext: " + context }
    ],
    max_tokens: 1024
  })
  return response.choices[0].message.content
}
