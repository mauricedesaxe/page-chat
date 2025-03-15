import { useEffect, useState } from "react"

/**
 * Hook to sync state with Chrome storage
 * @param key Storage key to sync with
 * @param initialValue Default value if nothing in storage
 */
export function useStorageSync<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)

  // Load value from storage on mount
  useEffect(() => {
    chrome.storage.local.get([key], (result) => {
      if (result[key] !== undefined) {
        setValue(result[key])
      }
    })

    // Listen for storage changes
    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange
    }) => {
      if (changes[key]) {
        setValue(changes[key].newValue)
      }
    }

    chrome.storage.local.onChanged.addListener(handleStorageChange)

    return () => {
      chrome.storage.local.onChanged.removeListener(handleStorageChange)
    }
  }, [key])

  // Function to update both state and storage
  const updateValue = (newValue: T) => {
    setValue(newValue)
    chrome.storage.local.set({ [key]: newValue })
  }

  return [value, updateValue] as const
}
