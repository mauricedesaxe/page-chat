import { downloadPage } from "~page-downloader"
import { extractKeyPoints } from "~summarizer"

// Set up context menu when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed/updated")

  // Define menu options for easy configuration
  const menuOptions = [
    {
      id: "extract-key-points-selection",
      title: "Quick Summary",
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
    info.menuItemId === "extract-key-points-selection" &&
    info.selectionText &&
    tab.id
  ) {
    try {
      // Set loading state and open popup immediately
      await chrome.storage.local.set({ isLoading: true })
      await openPopup()

      const result = await chrome.storage.local.get("anthropicKey")
      if (!result.anthropicKey) {
        throw new Error(
          "Please enter your Anthropic API key in the extension popup"
        )
      }

      const summary = await extractKeyPoints(
        info.selectionText,
        result.anthropicKey
      )

      await addNewResponse(summary)
    } catch (error) {
      console.error("Error generating response:", error)
      // Store error and clear loading state
      await chrome.storage.local.set({
        currentResponse: `Error: ${error.message}`,
        isLoading: false
      })
    }
  }
})

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "download-page") {
    try {
      // Get the active tab
      const [activeTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      if (!activeTab?.id) {
        throw new Error("No active tab found")
      }

      // Set loading state and open popup
      await chrome.storage.local.set({ isLoading: true })
      await openPopup()

      // Download the page content directly from the tab
      // Pass the tab ID instead of URL
      const pageContent = await downloadPage(activeTab.id)

      // Store the downloaded content
      await addNewResponse(pageContent)
    } catch (error) {
      console.error("Error downloading page:", error)
      await chrome.storage.local.set({
        currentResponse: `Error: ${error.message}`,
        isLoading: false
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

type HistoricalEntry = {
  response: string
  timestamp: string
}

/**
 * Add a new response to the history list
 * @param newResponse The new response to add
 */
async function addNewResponse(newResponse: string) {
  // Get existing history and current response
  const storage = await chrome.storage.local.get(["history", "currentResponse"])
  let history: HistoricalEntry[] = storage.history || []

  // If there's a current response, add it to history before replacing it
  if (storage.currentResponse) {
    history.push({
      response: storage.currentResponse,
      timestamp: new Date().toISOString()
    })
  }

  console.log("newResponse", newResponse)
  console.log("history", history)

  // Update storage with the new response and updated history
  await chrome.storage.local.set({
    currentResponse: newResponse,
    isLoading: false,
    history
  })
}
