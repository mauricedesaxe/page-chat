import { CHAT_ITEMS_KEY } from "~utils/storageKeys"

export type ChatRole = "user" | "assistant"

export type ChatMessage = {
  id: string
  text: string
  role: ChatRole
  timestamp: number
}

export class ChatModel {
  async getChatHistory(): Promise<ChatMessage[]> {
    const result = await chrome.storage.local.get(CHAT_ITEMS_KEY)
    if (!result.chat) {
      throw new Error("No chat history found")
    }
    return result.chat || []
  }

  async safeGetChatHistory(): Promise<ChatMessage[]> {
    const result = await chrome.storage.local.get(CHAT_ITEMS_KEY)
    if (!result.chat) {
      console.log("No chat found.")
      await chrome.storage.local.set({ chatHistory: [] })
      return []
    }
    return result.chatHistory || []
  }

  async addItem(text: string, role: ChatRole): Promise<void> {
    const chatHistory = await this.safeGetChatHistory()
    chatHistory.push({
      id: crypto.randomUUID(),
      text,
      role,
      timestamp: Date.now()
    })
    await chrome.storage.local.set({ chatHistory })
  }

  async deleteItem(id: string): Promise<void> {
    const chatHistory = await this.getChatHistory()
    const newChatHistory = chatHistory.filter((item) => item.id !== id)
    await chrome.storage.local.set({ chatHistory: newChatHistory })
  }
}

export const chatModel = new ChatModel()
