import { useStorageSync } from "~hooks/useStorageSync"

export function ContextManager() {
  const [context, setContext] = useStorageSync("context", [])

  return (
    <div>
      <h2>Context</h2>
      <ul>
        {context.map((item, index) => (
          <li key={index}>{item.slice(0, 100)}</li>
        ))}
      </ul>
    </div>
  )
}
