import { useState } from "react"

import { getOpenAIClient } from "~clients/openai"
import { contextModel } from "~ContextModel"
import { useStorageSync } from "~hooks/useStorageSync"

export const Chat = () => {
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useStorageSync("isLoading", false)
  const [response, setResponse] = useStorageSync("currentResponse", "")
  const [openaiKey] = useStorageSync("openaiKey", "")

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

      const result = await callOpenAIAPI(inputMessage, contextText, openaiKey)
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
      <ResponseDisplay isLoading={isLoading} response={response} />

      <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
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
    </div>
  )
}

const callOpenAIAPI = async (
  message: string,
  context: string,
  apiKey: string
) => {
  const client = getOpenAIClient(apiKey)
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful in-browser assistant that can answer questions about the context provided, but also generalize when the context is not relevant to the user's query."
      },
      { role: "user", content: message + "\n\nContext: " + context }
    ],
    max_tokens: 1024
  })
  return response.choices[0].message.content
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
