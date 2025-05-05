import { contextModel } from "~models/ContextModel"
import { downloadPage } from "~utils/pageDownloader"

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
