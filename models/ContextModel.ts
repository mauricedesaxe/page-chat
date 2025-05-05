import { CONTEXT_ITEMS_KEY } from "~utils/storageKeys"

export type ContextItem = {
  id: string
  text: string
  timestamp: number
}

export class ContextModel {
  async getContext(): Promise<ContextItem[]> {
    const result = await chrome.storage.local.get(CONTEXT_ITEMS_KEY)
    if (!result.context) {
      throw new Error("No context found")
    }
    return result.context || []
  }

  async safeGetContext(): Promise<ContextItem[]> {
    const result = await chrome.storage.local.get(CONTEXT_ITEMS_KEY)
    if (!result.context) {
      console.log("No context found.")
      await chrome.storage.local.set({ context: [] })
      return []
    }
    return result.context || []
  }

  async addItem(text: string): Promise<void> {
    const context = await this.safeGetContext()
    context.push({
      id:
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : globalThis.crypto?.randomUUID?.() || this.generateFallbackId(),
      text,
      timestamp: Date.now()
    })
    await chrome.storage.local.set({ context })
  }

  private generateFallbackId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    )
  }

  async deleteItem(id: string): Promise<void> {
    const context = await this.getContext()
    const newContext = context.filter((item) => item.id !== id)
    await chrome.storage.local.set({ context: newContext })
  }
}

export const contextModel = new ContextModel()
