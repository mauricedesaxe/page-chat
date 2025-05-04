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
      <ul>
        {context.map((item, index) => (
          <li key={index}>{item.text.slice(0, 100)}</li>
        ))}
      </ul>
    </details>
  )
}

export type ContextItem = {
  text: string
  timestamp: number
}
