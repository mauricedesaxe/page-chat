import type { ContextItem } from "~components/ContextManager"
import { downloadPage } from "~page-downloader"
import { extractKeyPoints } from "~summarizer"

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

      const result = await chrome.storage.local.get("context")
      if (!result.context) {
        console.log(
          "No context found, that's fine. We'll start with an empty context."
        )
        await chrome.storage.local.set({ context: [] })
      }
      const context = result.context || ([] as ContextItem[])
      context.push({
        id: crypto.randomUUID(),
        text: info.selectionText,
        timestamp: Date.now()
      })
      await chrome.storage.local.set({ context })
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

      const result = await chrome.storage.local.get("context")
      if (!result.context) {
        console.log(
          "No context found, that's fine. We'll start with an empty context."
        )
        await chrome.storage.local.set({ context: [] })
      }
      const context = result.context || ([] as ContextItem[])
      context.push({
        id: crypto.randomUUID(),
        text: pageContent,
        timestamp: Date.now()
      })
      await chrome.storage.local.set({ context })
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
