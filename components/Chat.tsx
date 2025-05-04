import { useState } from "react"

import { callOpenAIAPI } from "~clients/openai"
import { useStorageSync } from "~hooks/useStorageSync"
import { contextModel } from "~models/ContextModel"
import {
  CURRENT_RESPONSE_KEY,
  LOADING_STATUS_KEY,
  OPENAI_API_KEY
} from "~utils/storageKeys"

const PRE_MADE_QUERIES = [
  "ELI5: Break this down like I'm 5",
  "Debate Devil's Advocate",
  "Find hidden assumptions",
  "Translate to plain English",
  "What's the counterargument?",
  "Connect to real-world examples",
  "What questions remain unanswered?"
]

export const Chat = () => {
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useStorageSync(LOADING_STATUS_KEY, false)
  const [response, setResponse] = useStorageSync(CURRENT_RESPONSE_KEY, "")
  const [openaiKey] = useStorageSync(OPENAI_API_KEY, "")

  const sendMessage = async (message: string) => {
    if (!message.trim()) return

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
      result = await callOpenAIAPI(message, contextText, openaiKey)
      setResponse(result)
    } catch (error) {
      setResponse(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
      setInputMessage("")
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await sendMessage(inputMessage)
  }

  return (
    <div>
      {/* Pre-made Queries */}
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {PRE_MADE_QUERIES.map((query, index) => (
          <button
            key={index}
            onClick={() => sendMessage(query)}
            disabled={isLoading}
            style={{
              padding: "6px 12px",
              borderRadius: 16,
              border: "1px solid #ddd",
              backgroundColor: "#f5f5f5",
              fontSize: 14,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1
            }}>
            {query}
          </button>
        ))}
      </div>

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
