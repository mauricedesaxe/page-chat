import Anthropic from "@anthropic-ai/sdk"

export function getAnthropicClient(apiKey: string) {
  // Make sure apiKey is not empty or undefined
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("Anthropic API key is missing or empty")
  }

  // Log the first few characters of the key for debugging (be careful not to log the entire key)
  console.log("API key prefix:", apiKey.substring(0, 7) + "...")

  // Create a new client instance with additional headers
  return new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
    // Add additional headers to bypass CORS
    defaultHeaders: {
      // TODO: Remove this once we have a proper way to handle CORS (likely a proxy)
      Origin: "https://console.anthropic.com"
    }
  })
}

export async function callAnthropicAPI(
  message: string,
  context: string,
  apiKey: string
) {
  const client = getAnthropicClient(apiKey)
  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 1024,
    messages: [{ role: "user", content: message + "\n\nContext: " + context }]
  })
  return response.content[0].type === "text"
    ? response.content[0].text
    : "No text response from Anthropic"
}
