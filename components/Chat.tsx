import { useEffect, useState } from "react"

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
  "How are the context items related to each other?"
]

// Add timeout helper for API calls
const withTimeout = (promise, timeoutMs = 30000) => {
  let timeoutId
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Request timed out after ${timeoutMs}ms`))
    }, timeoutMs)
  })

  return Promise.race([promise, timeoutPromise]).finally(() =>
    clearTimeout(timeoutId)
  )
}

export const Chat = () => {
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useStorageSync(LOADING_STATUS_KEY, false)
  const [response, setResponse] = useStorageSync(CURRENT_RESPONSE_KEY, "")
  const [debugInfo, setDebugInfo] = useState("")

  // Reset loading state if stuck for more than 60 seconds
  useEffect(() => {
    let loadingTimer
    if (isLoading) {
      loadingTimer = setTimeout(() => {
        console.warn("Loading state stuck for 60 seconds, auto-resetting")
        setIsLoading(false)
        setResponse("Error: Request timed out. Please try again.")
      }, 60000)
    }
    return () => clearTimeout(loadingTimer)
  }, [isLoading, setIsLoading, setResponse])

  const sendMessage = async (message: string) => {
    if (!message.trim()) return

    setIsLoading(true)
    setDebugInfo("About to call OpenAI API...")

    try {
      console.log("Sending message to OpenAI API:", message)
      const result = await withTimeout(callOpenAIAPI(message, setDebugInfo))
      console.log("API response received successfully")
      setResponse(result)
      setDebugInfo("")
    } catch (error) {
      console.error("API call failed:", error)
      setResponse(`Error: ${error.message || "Unknown error occurred"}`)
      setDebugInfo(`API error: ${JSON.stringify(error)}`)
    } finally {
      setIsLoading(false)
      setInputMessage("")
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await sendMessage(inputMessage)
  }

  function getTextAreaRows() {
    const estimatedRows = Math.ceil(inputMessage.length / 40) + 1
    return estimatedRows
  }

  function getTextAreaHeight() {
    return `${getTextAreaRows() * 20}px`
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 8
            }}>
            <textarea
              id="chat-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  if (inputMessage.trim()) {
                    sendMessage(inputMessage)
                  }
                }
              }}
              placeholder="Ask about the context..."
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 4,
                border: "1px solid #ccc",
                fontSize: 16,
                height: getTextAreaHeight(),
                resize: "none",
                overflow: "hidden",
                transition: "all 0.3s ease-in-out"
              }}
              rows={getTextAreaRows()}
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
                width: "100%",
                marginLeft: "auto",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1,
                alignSelf: "center",
                transition: "all 0.3s ease-in-out"
              }}>
              Send
            </button>
          </div>
        </div>
      </form>

      <ResponseDisplay
        isLoading={isLoading}
        response={response}
        debugInfo={debugInfo}
      />
    </div>
  )
}

const ResponseDisplay = ({ isLoading, response, debugInfo }) => {
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
      <p>
        Generating response...
        <br />
        {debugInfo ? `${debugInfo}` : ""}
      </p>
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
