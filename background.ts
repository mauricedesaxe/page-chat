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

      // Update storage with summary and clear loading state
      await chrome.storage.local.set({
        currentResponse: summary,
        isLoading: false
      })
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

      if (!activeTab?.url) {
        throw new Error("No active tab URL found")
      }

      // Set loading state and open popup
      await chrome.storage.local.set({ isLoading: true })
      await openPopup()

      // Get the Jina API key
      const result = await chrome.storage.local.get("jinaKey")
      if (!result.jinaKey) {
        throw new Error("Please enter your Jina API key in the extension popup")
      }

      // Download the page content
      const pageContent = await downloadPage(activeTab.url, result.jinaKey)

      // Store the downloaded content
      await chrome.storage.local.set({
        currentResponse: pageContent,
        pageContent: pageContent,
        isLoading: false
      })
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
