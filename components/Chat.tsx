import React, { useState } from "react"

import { useBackgroundChat } from "~hooks/useBackgroundChat"

const PRE_MADE_QUERIES = [
  "ELI5: Break this down like I'm 5",
  "How are the context items related to each other?"
]

// Completely separate spinner component defined outside any other component
const SpinnerAnimation = React.memo(() => (
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
))

// Style element for animation defined once, outside components
const SpinnerStyle = () => (
  <style>{`
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `}</style>
)

export const Chat = () => {
  const [inputMessage, setInputMessage] = useState("")
  const { isLoading, response, error, progress, sendMessage, clearRequest } =
    useBackgroundChat()

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return

    try {
      await sendMessage(message)
      setInputMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await handleSendMessage(inputMessage)
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
            onClick={() => handleSendMessage(query)}
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
                    handleSendMessage(inputMessage)
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
        error={error}
        progress={progress}
        onClear={clearRequest}
      />
    </div>
  )
}

const ResponseDisplay = ({ isLoading, response, error, progress, onClear }) => {
  if (isLoading) {
    return (
      <div
        style={{
          padding: 16,
          backgroundColor: "#f0f0f0",
          borderRadius: 4,
          border: "1px solid #ddd",
          textAlign: "center"
        }}>
        <SpinnerStyle />
        <SpinnerAnimation />
        <p>
          Generating response...
          {progress && (
            <>
              <br />
              <span style={{ fontSize: 14, color: "#666" }}>{progress}</span>
            </>
          )}
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          padding: 16,
          backgroundColor: "#fee",
          borderRadius: 4,
          border: "1px solid #fcc",
          color: "#c00"
        }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
          <h3>Error</h3>
          <button
            onClick={onClear}
            style={{
              padding: "4px 8px",
              borderRadius: 4,
              border: "1px solid #ccc",
              backgroundColor: "#fff",
              cursor: "pointer"
            }}>
            Clear
          </button>
        </div>
        <p style={{ fontSize: 16, lineHeight: 1.5 }}>{error}</p>
      </div>
    )
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
            onClick={onClear}
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
