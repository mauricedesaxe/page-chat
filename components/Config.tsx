import { AnthropicKeyConfig } from "./configs/AnthropicKeyConfig"
import { OpenAIKeyConfig } from "./configs/OpenAIKeyConfig"

export function Config({ anthropicKey, setAnthropicKey }) {
  return (
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
        <OpenAIKeyConfig />
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
          Note: Your API keys are stored locally on your device. Never share
          your API keys with others.
        </div>
      </div>
    </details>
  )
}
