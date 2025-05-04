import { useStorageSync } from "~hooks/useStorageSync"
import { contextModel, type ContextItem } from "~models/ContextModel"
import { CONTEXT_ITEMS_KEY } from "~utils/storageKeys"

export function ContextManager() {
  const [context, setContext] = useStorageSync<ContextItem[]>(
    CONTEXT_ITEMS_KEY,
    []
  )

  const handleDelete = async (id: string) => {
    try {
      await contextModel.deleteItem(id)
    } catch (error) {
      console.error("Failed to delete context item:", error)
    }
  }

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
                    position: "relative",
                    paddingRight: "52px"
                  }}>
                  <div
                    style={{
                      fontSize: "14px",
                      marginBottom: "4px",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                    {item.text.slice(0, 100)}
                    {item.text.length > 100 && "..."}
                  </div>
                  <div style={{ fontSize: "12px", color: "#888" }}>
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "white"
                      e.currentTarget.style.backgroundColor = "red"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#333"
                      e.currentTarget.style.backgroundColor =
                        "rgba(255, 0, 0, 0.1)"
                    }}
                    style={{
                      position: "absolute",
                      top: "0",
                      right: "0",
                      height: "100%",
                      width: "40px",
                      backgroundColor: "rgba(255, 0, 0, 0.1)",
                      border: "none",
                      cursor: "pointer",
                      color: "#333",
                      fontSize: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderTopRightRadius: "4px",
                      borderBottomRightRadius: "4px"
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
