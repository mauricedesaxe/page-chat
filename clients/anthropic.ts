import Anthropic from "@anthropic-ai/sdk"

export function getAnthropicClient(apiKey: string) {
  // Make sure apiKey is not empty or undefined
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("Anthropic API key is missing or empty")
  }

  // Log the first few characters of the key for debugging (be careful not to log the entire key)
  console.log("API key prefix:", apiKey.substring(0, 7) + "...")

  // Create a new client instance each time to ensure we're using the latest key
  return new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true
  })
}
