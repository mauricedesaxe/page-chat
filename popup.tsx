import { useEffect, useState } from "react"

// @ts-ignore
import icon from "~assets/icon_2.png"
import { Config } from "~components/Config"
import { ResponseDisplay } from "~components/ResponseDisplay"
import { useStorageSync } from "~hooks/useStorageSync"

function IndexPopup() {
  const [anthropicKey, setAnthropicKey] = useStorageSync("anthropicKey", "")
  const [jinaKey, setJinaKey] = useStorageSync("jinaKey", "")
  const [response, setResponse] = useStorageSync("currentResponse", "")
  const [isLoading, setIsLoading] = useStorageSync("isLoading", false)

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
          <ResponseDisplay isLoading={isLoading} response={response} />

          <Config
            anthropicKey={anthropicKey}
            setAnthropicKey={setAnthropicKey}
            jinaKey={jinaKey}
            setJinaKey={setJinaKey}
          />
        </div>
      </div>
    </>
  )
}

export default IndexPopup
