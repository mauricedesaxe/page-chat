import { contextModel, type ContextItem } from "~models/ContextModel"

describe("ContextModel", () => {
  let mockUUID: string

  beforeEach(() => {
    jest.clearAllMocks()
    mockUUID = "1234-5678-9101"
    Object.defineProperty(global.crypto, "randomUUID", {
      value: jest.fn().mockReturnValue(mockUUID),
      configurable: true
    })
  })

  it("should add an item to context", async () => {
    const mockNow = 1623456789000
    jest.spyOn(Date, "now").mockReturnValue(mockNow)

    // Mock the Promise-based implementation
    ;(chrome.storage.local.get as jest.Mock).mockResolvedValue({ context: [] })

    await contextModel.addItem("Test text")

    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      context: [
        {
          id: mockUUID,
          text: "Test text",
          timestamp: mockNow
        }
      ]
    })
  })

  it("should delete an item from context", async () => {
    const mockItems: ContextItem[] = [
      { id: "1", text: "Item 1", timestamp: 100 },
      { id: "2", text: "Item 2", timestamp: 200 }
    ]

    // Mock the Promise-based implementation
    ;(chrome.storage.local.get as jest.Mock).mockResolvedValue({
      context: mockItems
    })

    await contextModel.deleteItem("1")

    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      context: [{ id: "2", text: "Item 2", timestamp: 200 }]
    })
  })

  it("should create empty context when missing in safeGetContext", async () => {
    // Mock the storage to return empty result (no context key)
    ;(chrome.storage.local.get as jest.Mock).mockResolvedValue({})

    const result = await contextModel.safeGetContext()

    expect(result).toEqual([])
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ context: [] })
  })
})
