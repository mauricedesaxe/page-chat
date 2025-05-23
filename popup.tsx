// @ts-ignore
import icon from "~assets/icon_2.png"
import { Chat } from "~components/Chat"
import { Config } from "~components/Config"
import { ContextManager } from "~components/ContextManager"

function IndexPopup() {
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
          <Chat />

          <ContextManager />

          <Config />

          <button
            onClick={() => {
              if (
                confirm(
                  "Are you sure you want to clear all data? This action cannot be undone."
                )
              ) {
                chrome.storage.local.clear()
                alert("All data has been cleared successfully.")
              }
            }}
            style={{
              padding: "8px 12px",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer"
            }}>
            Clear All Data
          </button>
        </div>
      </div>
    </>
  )
}

export default IndexPopup
