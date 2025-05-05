import OpenAI from "openai"

import { contextModel } from "~models/ContextModel"
import { OPENAI_API_KEY } from "~utils/storageKeys"

let openai: OpenAI | null = null

export function getOpenAIClient(apiKey: string) {
  if (!openai || openai.apiKey !== apiKey) {
    try {
      openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })
    } catch (error) {
      console.error("Error initializing OpenAI client:", error)
      throw new Error(`Failed to initialize OpenAI client: ${error.message}`)
    }
  }
  return openai
}

export async function callOpenAIAPI(
  message: string,
  setDebugInfo?: (info: string) => void
) {
  try {
    if (setDebugInfo) {
      setDebugInfo("Validating message...")
    }
    if (!message || typeof message !== "string") {
      throw new Error("Invalid message provided")
    }

    if (setDebugInfo) {
      setDebugInfo("Getting API key from storage...")
    }
    const result = await chrome.storage.local.get(OPENAI_API_KEY)
    const openaiKey = result?.[OPENAI_API_KEY]
    if (
      !openaiKey ||
      typeof openaiKey !== "string" ||
      openaiKey.trim() === ""
    ) {
      throw new Error(
        "No valid API key found. Please add your OpenAI API key in settings."
      )
    }

    if (setDebugInfo) {
      setDebugInfo("Getting context...")
    }
    let context = []
    try {
      context = await contextModel.safeGetContext()
    } catch (contextError) {
      console.error("Error getting context:", contextError)
      context = []
    }

    if (setDebugInfo) {
      setDebugInfo("Formatting context...")
    }
    const contextText =
      context.length > 0
        ? context
            .map((item, idx) => `Context item ${idx + 1}:\n\n${item.text}`)
            .join("\n\n===\n\n")
        : "No context available."

    if (setDebugInfo) {
      setDebugInfo("Initializing OpenAI client...")
    }
    const client = getOpenAIClient(openaiKey)
    if (!client) {
      throw new Error("Failed to initialize OpenAI client")
    }

    if (setDebugInfo) {
      setDebugInfo("Making OpenAI API call...")
    }
    console.log("Making OpenAI API call...")
    const startTime = Date.now()

    // Set up progress updates if debug info is available
    let progressInterval
    if (setDebugInfo) {
      progressInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime
        setDebugInfo(
          `API call in progress... (elapsed: ${formatTime(elapsedTime)})`
        )
      }, 300)
    }

    let response
    try {
      response = await client.chat.completions.create({
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

      const endTime = Date.now()
      console.log(
        `OpenAI API call completed in ${formatTime(endTime - startTime)}`
      )
      if (setDebugInfo) {
        setDebugInfo(
          `OpenAI API call completed in ${formatTime(endTime - startTime)}`
        )
      }
    } finally {
      // Clean up interval regardless of success or failure
      if (progressInterval) {
        clearInterval(progressInterval)
      }
    }

    if (setDebugInfo) {
      setDebugInfo("Checking response...")
    }

    if (!response?.choices?.length || !response.choices[0]?.message?.content) {
      throw new Error("Invalid response received from OpenAI")
    }

    if (setDebugInfo) {
      setDebugInfo("Returning response...")
    }

    return response.choices[0].message.content
  } catch (error) {
    console.error("OpenAI API call failed:", error)
    if (setDebugInfo) {
      setDebugInfo("OpenAI API call failed")
    }

    // Provide more helpful error messages
    if (error.status === 401) {
      throw new Error(
        "Invalid API key. Please check your OpenAI API key and try again."
      )
    } else if (error.status === 429) {
      throw new Error(
        "Rate limit exceeded. Please try again later or check your API usage limits."
      )
    } else if (error.message?.includes("network")) {
      throw new Error(
        "Network error. Please check your internet connection and try again."
      )
    }

    // Re-throw with better context
    throw new Error(
      `Error calling OpenAI API: ${error.message || "Unknown error"}`
    )
  }
}

function formatTime(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`
  } else if (ms < 60000) {
    const seconds = (ms / 1000).toFixed(1)
    return `${seconds}s`
  } else {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }
}
