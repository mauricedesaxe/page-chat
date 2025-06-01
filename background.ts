import OpenAI from "openai"

import { contextModel } from "~models/ContextModel"
import {
  MESSAGE_TYPES,
  type BackgroundMessage,
  type ChatRequestState
} from "~utils/messageTypes"
import { downloadPage } from "~utils/pageDownloader"
import { CURRENT_CHAT_REQUEST_KEY, OPENAI_API_KEY } from "~utils/storageKeys"

let openai: OpenAI | null = null

function getOpenAIClient(apiKey: string): OpenAI {
  if (!openai || openai.apiKey !== apiKey) {
    try {
      openai = new OpenAI({ apiKey })
    } catch (error) {
      console.error("Error initializing OpenAI client:", error)
      throw new Error(`Failed to initialize OpenAI client: ${error.message}`)
    }
  }
  return openai
}

async function updateChatRequestState(
  requestId: string,
  updates: Partial<ChatRequestState>
) {
  const result = await chrome.storage.local.get(CURRENT_CHAT_REQUEST_KEY)
  const currentState = result[CURRENT_CHAT_REQUEST_KEY] as ChatRequestState

  if (currentState?.requestId === requestId) {
    const newState: ChatRequestState = {
      ...currentState,
      ...updates,
      lastUpdated: Date.now()
    }
    await chrome.storage.local.set({
      [CURRENT_CHAT_REQUEST_KEY]: newState
    })
  }
}

async function processChatRequest(requestId: string, message: string) {
  try {
    // Update progress: Validating message
    await updateChatRequestState(requestId, {
      progress: "Validating message..."
    })

    if (!message || typeof message !== "string") {
      throw new Error("Invalid message provided")
    }

    // Update progress: Getting API key
    await updateChatRequestState(requestId, {
      progress: "Getting API key from storage..."
    })

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

    // Update progress: Getting context
    await updateChatRequestState(requestId, {
      progress: "Getting context..."
    })

    let context = []
    try {
      context = await contextModel.safeGetContext()
    } catch (contextError) {
      console.error("Error getting context:", contextError)
      context = []
    }

    // Update progress: Formatting context
    await updateChatRequestState(requestId, {
      progress: "Formatting context..."
    })

    const contextText =
      context.length > 0
        ? context
            .map((item, idx) => `Context item ${idx + 1}:\n\n${item.text}`)
            .join("\n\n===\n\n")
        : "No context available."

    // Update progress: Initializing OpenAI client
    await updateChatRequestState(requestId, {
      progress: "Initializing OpenAI client..."
    })

    const client = getOpenAIClient(openaiKey)
    if (!client) {
      throw new Error("Failed to initialize OpenAI client")
    }

    // Update progress: Making API call
    await updateChatRequestState(requestId, {
      progress: "Making OpenAI API call..."
    })

    console.log("Making OpenAI API call...")
    const startTime = Date.now()

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

    const endTime = Date.now()
    console.log(`OpenAI API call completed in ${endTime - startTime}ms`)

    if (!response?.choices?.length || !response.choices[0]?.message?.content) {
      throw new Error("Invalid response received from OpenAI")
    }

    // Update state with success
    await updateChatRequestState(requestId, {
      status: "success",
      response: response.choices[0].message.content,
      progress: "Completed"
    })

    return response.choices[0].message.content
  } catch (error) {
    console.error("OpenAI API call failed:", error)

    let errorMessage = `Error calling OpenAI API: ${error.message || "Unknown error"}`

    // Provide more helpful error messages
    if (error.status === 401) {
      errorMessage =
        "Invalid API key. Please check your OpenAI API key and try again."
    } else if (error.status === 429) {
      errorMessage =
        "Rate limit exceeded. Please try again later or check your API usage limits."
    } else if (error.message?.includes("network")) {
      errorMessage =
        "Network error. Please check your internet connection and try again."
    }

    // Update state with error
    await updateChatRequestState(requestId, {
      status: "error",
      error: errorMessage,
      progress: "Failed"
    })

    throw new Error(errorMessage)
  }
}

// Handle messages from popup
chrome.runtime.onMessage.addListener(
  (message: BackgroundMessage, sender, sendResponse) => {
    if (message.type === MESSAGE_TYPES.SEND_CHAT_REQUEST) {
      const { requestId, message: chatMessage } = message.payload

      // Initialize request state in storage
      const initialState: ChatRequestState = {
        requestId,
        status: "pending",
        message: chatMessage,
        timestamp: Date.now(),
        lastUpdated: Date.now()
      }

      chrome.storage.local
        .set({
          [CURRENT_CHAT_REQUEST_KEY]: initialState
        })
        .then(() => {
          // Process the request asynchronously
          processChatRequest(requestId, chatMessage).catch((error) => {
            console.error("Error processing chat request:", error)
          })
        })

      // Send immediate acknowledgment
      sendResponse({ success: true })
      return true // Keep the message channel open for async response
    }

    return false
  }
)

// Set up context menu when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed/updated")

  // Define menu options for easy configuration
  const menuOptions = [
    {
      id: "add-selection-to-context",
      title: "Add Selection to Context",
      contexts: ["selection"] as chrome.contextMenus.ContextType[]
    }
    // Add more menu items here as needed
  ]

  // Remove any existing context menu items and create new ones
  chrome.contextMenus.removeAll(() => {
    for (const option of menuOptions) {
      chrome.contextMenus.create(option, () => {
        // Log success or failure of context menu creation
        if (chrome.runtime.lastError) {
          console.error(
            `Error creating context menu "${option.title}":`,
            chrome.runtime.lastError
          )
        } else {
          console.log(`Context menu "${option.title}" created successfully`)
        }
      })
    }
  })
})

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (
    info.menuItemId === "add-selection-to-context" &&
    info.selectionText &&
    tab.id
  ) {
    try {
      await openPopup()
      await contextModel.addItem(info.selectionText)
    } catch (error) {
      console.error("Error adding selection to context:", error)
      await chrome.storage.local.set({
        currentResponse: `Error: ${error.message}`
      })
    }
  }
})

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "download-page") {
    try {
      const [activeTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })
      if (!activeTab?.id) {
        throw new Error("No active tab found")
      }

      await openPopup()
      const pageContent = await downloadPage(activeTab.id)
      await contextModel.addItem(pageContent)
    } catch (error) {
      console.error("Error downloading page:", error)
      await chrome.storage.local.set({
        currentResponse: `Error: ${error.message}`
      })
    }
  }
})

async function openPopup() {
  // Get the current window
  const window = await chrome.windows.getCurrent()

  // Get all tabs in the current window
  const tabs = await chrome.tabs.query({ active: true, windowId: window.id })

  if (tabs[0]) {
    // Show the extension's popup
    await chrome.action.openPopup()
  }
}
