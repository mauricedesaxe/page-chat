import OpenAI from "openai"

let openai: OpenAI | null = null

export function getOpenAIClient(apiKey: string) {
  if (!openai) {
    openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })
  }
  return openai
}
