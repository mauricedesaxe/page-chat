import { act, renderHook } from "@testing-library/react"

import { useStorageSync } from "~hooks/useStorageSync"

describe("useStorageSync", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(chrome.storage.local.get as jest.Mock).mockImplementation(
      (keys, callback) => {
        callback({})
      }
    )
  })

  it("returns the initial value when storage is empty", () => {
    const { result } = renderHook(() =>
      useStorageSync("testKey", "initialValue")
    )
    expect(result.current[0]).toBe("initialValue")
  })

  it("updates storage when value is changed", () => {
    const { result } = renderHook(() =>
      useStorageSync("testKey", "initialValue")
    )

    act(() => {
      result.current[1]("newValue")
    })

    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      testKey: "newValue"
    })
    expect(result.current[0]).toBe("newValue")
  })

  it("loads value from storage", () => {
    ;(chrome.storage.local.get as jest.Mock).mockImplementation(
      (keys, callback) => {
        callback({ testKey: "storedValue" })
      }
    )

    const { result } = renderHook(() =>
      useStorageSync("testKey", "initialValue")
    )
    expect(result.current[0]).toBe("storedValue")
  })
})
