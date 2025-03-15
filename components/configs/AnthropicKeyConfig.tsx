import { useState } from "react"

export const AnthropicKeyConfig = ({ anthropicKey, setAnthropicKey }) => {
  const [isVisible, setIsVisible] = useState(false)

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value
    setAnthropicKey(newKey)
    chrome.storage.local.set({ anthropicKey: newKey })
  }

  const clearApiKey = () => {
    setAnthropicKey("")
    chrome.storage.local.remove("anthropicKey")
  }

  return (
    <>
      <label
        htmlFor="apiKey"
        style={{ display: "block", fontSize: 16, lineHeight: 1.5 }}>
        Anthropic API Key:
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          id="apiKey"
          type={isVisible ? "text" : "password"}
          value={anthropicKey}
          onChange={handleKeyChange}
          style={{
            width: "100%",
            borderRadius: 4,
            padding: 4,
            border: "1px solid #ccc",
            outline: "none",
            fontSize: 14,
            fontFamily: "monospace",
            boxSizing: "border-box",
            height: 32
          }}
          placeholder="Enter your Anthropic API key"
        />
        <button
          onClick={() => setIsVisible(!isVisible)}
          style={{
            padding: "4px 8px",
            borderRadius: 4,
            border: "1px solid #ccc"
          }}>
          {isVisible ? "Hide" : "Show"}
        </button>
      </div>
      <button
        onClick={clearApiKey}
        style={{
          padding: "4px 8px",
          borderRadius: 4,
          border: "1px solid #ccc",
          backgroundColor: "#fff",
          cursor: "pointer"
        }}>
        Clear API Key
      </button>
    </>
  )
}
