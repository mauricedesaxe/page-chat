import { useEffect, useState } from "react"

import { MESSAGE_TYPES, type ChatRequestState } from "~utils/messageTypes"
import { CURRENT_CHAT_REQUEST_KEY } from "~utils/storageKeys"

/**
 * Hook to handle chat requests via background service worker
 */
export function useBackgroundChat() {
  const [requestState, setRequestState] = useState<ChatRequestState | null>(
    null
  )

  // Listen for storage changes to update request state
  useEffect(() => {
    // Load initial state
    chrome.storage.local.get([CURRENT_CHAT_REQUEST_KEY], (result) => {
      if (result[CURRENT_CHAT_REQUEST_KEY]) {
        setRequestState(result[CURRENT_CHAT_REQUEST_KEY])
      }
    })

    // Listen for changes
    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange
    }) => {
      if (changes[CURRENT_CHAT_REQUEST_KEY]) {
        setRequestState(changes[CURRENT_CHAT_REQUEST_KEY].newValue || null)
      }
    }

    chrome.storage.local.onChanged.addListener(handleStorageChange)

    return () => {
      chrome.storage.local.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  const sendMessage = async (message: string) => {
    const requestId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    try {
      // Send message to background
      await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.SEND_CHAT_REQUEST,
        payload: {
          requestId,
          message
        }
      })
    } catch (error) {
      console.error("Failed to send message to background:", error)
      throw new Error("Failed to initiate chat request")
    }
  }

  const clearRequest = async () => {
    await chrome.storage.local.remove(CURRENT_CHAT_REQUEST_KEY)
    setRequestState(null)
  }

  return {
    requestState,
    sendMessage,
    clearRequest,
    isLoading: requestState?.status === "pending",
    response: requestState?.response,
    error: requestState?.error,
    progress: requestState?.progress
  }
}
