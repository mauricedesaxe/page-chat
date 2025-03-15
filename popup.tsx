import { useEffect, useState } from "react"

// @ts-ignore
import icon from "~assets/icon_2.png"

const OpenAIKeyConfig = ({ anthropicKey, setOpenAIKey }) => {
  const [isVisible, setIsVisible] = useState(false)

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value
    setOpenAIKey(newKey)
    chrome.storage.local.set({ anthropicKey: newKey })
  }

  const clearApiKey = () => {
    setOpenAIKey("")
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

const JinaAIKeyConfig = ({ jinaKey, setJinaKey }) => {
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

const SummaryDisplay = ({ isLoading, summary }) => {
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
      <p>Generating summary...</p>
    </div>
  )

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (summary) {
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
          <h3>Summary</h3>
          <button
            onClick={() => {
              chrome.storage.local.remove("currentSummary")
            }}
            style={{
              padding: "4px 8px",
              borderRadius: 4,
              border: "1px solid #ccc",
              backgroundColor: "#fff",
              cursor: "pointer"
            }}>
            Clear Summary
          </button>
        </div>
        <p style={{ whiteSpace: "pre-wrap", fontSize: 16, lineHeight: 1.5 }}>
          {summary}
        </p>
      </div>
    )
  }

  return null
}

function IndexPopup() {
  const [anthropicKey, setOpenAIKey] = useState("")
  const [jinaKey, setJinaKey] = useState("")
  const [summary, setSummary] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load saved API key and states on mount
    chrome.storage.local.get(
      ["anthropicKey", "jinaKey", "currentSummary", "isLoading"],
      (result) => {
        if (result.anthropicKey) {
          setOpenAIKey(result.anthropicKey)
        }
        if (result.currentSummary) {
          setSummary(result.currentSummary)
        }
        if (result.jinaKey) {
          setJinaKey(result.jinaKey)
        }
        setIsLoading(!!result.isLoading)
      }
    )

    // Listen for storage changes
    const handleStorageChange = (changes, namespace) => {
      if (namespace === "local") {
        if (changes.currentSummary) {
          setSummary(changes.currentSummary.newValue)
        }
        if (changes.isLoading) {
          setIsLoading(changes.isLoading.newValue)
        }
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  return (
    <>
      <div
        style={{
          backgroundColor: "#f9f9f9",
          padding: 16,
          borderRadius: 4,
          fontSize: 18,
          lineHeight: 1.5
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img
            src={icon}
            alt="Page Chat"
            width={128}
            height={128}
            style={{ borderRadius: 4 }}
          />
          <div>
            <h2 style={{ margin: 0, marginBottom: 2 }}>Page Chat</h2>
            <p style={{ margin: 0 }}>
              Talk to LLMs about any webpage you're on.
            </p>
          </div>
        </div>
      </div>
      <div style={{ padding: 16, minWidth: 420 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SummaryDisplay isLoading={isLoading} summary={summary} />
          <OpenAIKeyConfig
            anthropicKey={anthropicKey}
            setOpenAIKey={setOpenAIKey}
          />
          <JinaAIKeyConfig jinaKey={jinaKey} setJinaKey={setJinaKey} />
          <div
            className="warning"
            style={{
              backgroundColor: "#fff3cd",
              color: "#856404",
              padding: 8,
              borderRadius: 4,
              fontSize: 12
            }}>
            Note: Your API keys are stored locally on your device. Never share
            your API keys with others.
          </div>
        </div>
      </div>
    </>
  )
}

export default IndexPopup
