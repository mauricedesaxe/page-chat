import { useState } from "react"

import { useStorageSync } from "~hooks/useStorageSync"
import { ANTHROPIC_API_KEY } from "~utils/storageKeys"

export const AnthropicKeyConfig = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [anthropicKey, setAnthropicKey] = useStorageSync(ANTHROPIC_API_KEY, "")

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value
    setAnthropicKey(newKey)
  }

  const clearApiKey = () => {
    setAnthropicKey("")
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
