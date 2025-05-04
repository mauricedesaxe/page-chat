import { useState } from "react"

import { callAnthropicAPI } from "~clients/anthropic"
import { callOpenAIAPI } from "~clients/openai"
import { useStorageSync } from "~hooks/useStorageSync"
import { contextModel } from "~models/ContextModel"
import {
  AI_PROVIDER_KEY,
  ANTHROPIC_API_KEY,
  CURRENT_RESPONSE_KEY,
  LOADING_STATUS_KEY,
  OPENAI_API_KEY
} from "~utils/storageKeys"

export const Chat = () => {
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useStorageSync(LOADING_STATUS_KEY, false)
  const [response, setResponse] = useStorageSync(CURRENT_RESPONSE_KEY, "")
  const [aiProvider, setAiProvider] = useStorageSync(AI_PROVIDER_KEY, "openai")
  const [openaiKey] = useStorageSync(OPENAI_API_KEY, "")
  const [anthropicKey] = useStorageSync(ANTHROPIC_API_KEY, "")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    setIsLoading(true)
    try {
      const context = await contextModel.safeGetContext()
      const contextText = context.map((item) => item.text).join("\n\n")
      if (!contextText) {
        setResponse(
          "No context available. Add some text using the right-click menu."
        )
        setIsLoading(false)
        setInputMessage("")
        return
      }

      let result: string
      if (aiProvider === "openai") {
        result = await callOpenAIAPI(inputMessage, contextText, openaiKey)
      } else if (aiProvider === "anthropic") {
        result = await callAnthropicAPI(inputMessage, contextText, anthropicKey)
      }
      setResponse(result)
    } catch (error) {
      setResponse(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
      setInputMessage("")
    }
  }

  return (
    <div>
      {/* Chat Input */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about the context..."
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 4,
              border: "1px solid #ccc",
              fontSize: 16
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            style={{
              padding: "8px 16px",
              borderRadius: 4,
              border: "1px solid #0066cc",
              backgroundColor: "#0066cc",
              color: "white",
              fontSize: 16,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1
            }}>
            Send
          </button>
        </div>
      </form>

      {/* AI Provider */}
      <div style={{ marginBottom: 16 }}>
        <label>
          <input
            type="radio"
            name="aiProvider"
            value="openai"
            checked={aiProvider === "openai"}
            onChange={() => setAiProvider("openai")}
          />
          OpenAI
        </label>
        <label>
          <input
            type="radio"
            name="aiProvider"
            value="anthropic"
            checked={aiProvider === "anthropic"}
            onChange={() => setAiProvider("anthropic")}
          />
          Anthropic
        </label>
      </div>

      <ResponseDisplay isLoading={isLoading} response={response} />
    </div>
  )
}

const ResponseDisplay = ({ isLoading, response }) => {
  const LoadingSpinner = () => (
    <div
      style={{
        padding: 16,
        backgroundColor: "#f0f0f0",
        borderRadius: 4,
        border: "1px solid #ddd",
        textAlign: "center"
      }}>
      <div
        style={{
          display: "inline-block",
          width: 20,
          height: 20,
          border: "2px solid #ccc",
          borderTopColor: "#333",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}
      />
      <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      <p>Generating response...</p>
    </div>
  )

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (response) {
    return (
      <div
        style={{
          padding: 16,
          backgroundColor: "#f0f0f0",
          borderRadius: 4,
          border: "1px solid #ddd"
        }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
          <h3>Response</h3>
          <button
            onClick={() => {
              chrome.storage.local.remove("currentResponse")
            }}
            style={{
              padding: "4px 8px",
              borderRadius: 4,
              border: "1px solid #ccc",
              backgroundColor: "#fff",
              cursor: "pointer"
            }}>
            Clear Response
          </button>
        </div>
        <p style={{ whiteSpace: "pre-wrap", fontSize: 16, lineHeight: 1.5 }}>
          {response}
        </p>
      </div>
    )
  }

  return null
}
