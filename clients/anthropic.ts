import Anthropic from "@anthropic-ai/sdk"

let anthropic: Anthropic | null = null

export function getAnthropicClient(apiKey: string) {
  if (!anthropic) {
    anthropic = new Anthropic({ apiKey })
  }
  return anthropic
}
