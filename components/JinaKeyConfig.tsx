import { useState } from "react"

export const JinaKeyConfig = ({ jinaKey, setJinaKey }) => {
  const [isVisible, setIsVisible] = useState(false)

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value
    setJinaKey(newKey)
    chrome.storage.local.set({ jinaKey: newKey })
  }

  const clearApiKey = () => {
    setJinaKey("")
    chrome.storage.local.remove("jinaKey")
  }

  return (
    <>
      <label
        htmlFor="jinaKey"
        style={{ display: "block", fontSize: 16, lineHeight: 1.5 }}>
        Jina AI API Key:
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          id="jinaKey"
          type={isVisible ? "text" : "password"}
          value={jinaKey}
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
          placeholder="Enter your Jina AI API key"
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
