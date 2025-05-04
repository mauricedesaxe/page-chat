import { useStorageSync } from "~hooks/useStorageSync"

export function ContextManager() {
  const [context, setContext] = useStorageSync<ContextItem[]>("context", [])

  return (
    <details open>
      <summary
        style={{
          cursor: "pointer",
          fontWeight: "bold",
          padding: "8px 0",
          userSelect: "none"
        }}>
        <h3
          style={{
            margin: 0,
            display: "inline-block"
          }}>
          Context Manager
        </h3>
      </summary>
      <div style={{ marginTop: 16 }}>
        {context.length === 0 ? (
          <div style={{ color: "#666", fontStyle: "italic" }}>
            No context items yet. Add text using the right-click menu.
          </div>
        ) : (
          <ul style={{ padding: 0, margin: 0, listStyleType: "none" }}>
            {[...context]
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((item, index) => (
                <li
                  key={index}
                  style={{
                    padding: "8px 12px",
                    margin: "8px 0",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "4px",
                    borderLeft: "3px solid #007bff",
                    position: "relative"
                  }}>
                  <div style={{ fontSize: "14px", marginBottom: "4px" }}>
                    {item.text.slice(0, 100)}
                    {item.text.length > 100 && "..."}
                  </div>
                  <div style={{ fontSize: "12px", color: "#888" }}>
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                  <button
                    onClick={() => {
                      const newContext = [...context]
                      newContext.splice(index, 1)
                      setContext(newContext)
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "red")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#999")}
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#999",
                      fontSize: "12px"
                    }}>
                    ✕
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>
    </details>
  )
}

export type ContextItem = {
  text: string
  timestamp: number
}
