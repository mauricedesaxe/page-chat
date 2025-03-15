import { useEffect, useState } from "react"

// @ts-ignore
import icon from "~assets/icon_2.png"
import { AnthropicKeyConfig } from "~components/AnthropicKeyConfig"
import { JinaKeyConfig } from "~components/JinaKeyConfig"
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

          <details>
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
                API Configuration
              </h3>
            </summary>
            <div
              style={{
                marginTop: 16,
                display: "flex",
                flexDirection: "column",
                gap: 16
              }}>
              <AnthropicKeyConfig
                anthropicKey={anthropicKey}
                setAnthropicKey={setAnthropicKey}
              />
              <JinaKeyConfig jinaKey={jinaKey} setJinaKey={setJinaKey} />
              <div
                className="warning"
                style={{
                  backgroundColor: "#fff3cd",
                  color: "#856404",
                  padding: 8,
                  borderRadius: 4,
                  fontSize: 12,
                  marginTop: 8
                }}>
                Note: Your API keys are stored locally on your device. Never
                share your API keys with others.
              </div>
            </div>
          </details>
        </div>
      </div>
    </>
  )
}

export default IndexPopup
