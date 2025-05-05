import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"

import "@testing-library/jest-dom"

import { act } from "react-dom/test-utils"

import { callOpenAIAPI } from "~clients/openai"
import { Chat } from "~components/Chat"
import { CURRENT_RESPONSE_KEY, LOADING_STATUS_KEY } from "~utils/storageKeys"

// Mock the entire module before importing any dependencies that use it
jest.mock("~clients/openai", () => ({
  callOpenAIAPI: jest.fn()
}))

// Mock the useStorageSync hook
jest.mock("~hooks/useStorageSync", () => ({
  useStorageSync: (key, initialValue) => {
    const [state, setState] = React.useState(initialValue)
    return [state, setState]
  }
}))

describe("Chat", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("handles successful API calls correctly", async () => {
    // Mock successful API call
    ;(callOpenAIAPI as jest.Mock).mockResolvedValue("API response")

    render(<Chat />)

    const input = screen.getByPlaceholderText("Ask about the context...")
    const sendButton = screen.getByText("Send")

    // Type message and submit
    await userEvent.type(input, "Test message")
    await userEvent.click(sendButton)

    // Check loading state and API call
    expect(callOpenAIAPI).toHaveBeenCalledWith("Test message")

    // Wait for response
    await screen.findByText("API response")

    // Verify input was cleared
    expect(input).toHaveValue("")
  })

  it("handles API errors correctly", async () => {
    // Mock failed API call
    ;(callOpenAIAPI as jest.Mock).mockRejectedValue(new Error("API failure"))

    render(<Chat />)

    const input = screen.getByPlaceholderText("Ask about the context...")
    const sendButton = screen.getByText("Send")

    // Type message and submit
    await userEvent.type(input, "Test message")
    await userEvent.click(sendButton)

    // Check loading state and API call
    expect(callOpenAIAPI).toHaveBeenCalledWith("Test message")

    // Wait for error message
    await screen.findByText("Error: API failure")

    // Verify input was cleared
    expect(input).toHaveValue("")
  })

  it("handles pre-made queries", async () => {
    ;(callOpenAIAPI as jest.Mock).mockResolvedValue("Pre-made query response")

    render(<Chat />)

    // Click pre-made query
    const preMadeQueryButton = screen.getByText(
      "ELI5: Break this down like I'm 5"
    )
    await userEvent.click(preMadeQueryButton)

    // Check API call with correct query
    expect(callOpenAIAPI).toHaveBeenCalledWith(
      "ELI5: Break this down like I'm 5"
    )

    // Wait for response
    await screen.findByText("Pre-made query response")
  })

  it("shows and hides loading state correctly", async () => {
    // Mock API call with a Promise that won't resolve until we tell it to
    const mockResponse = "API response"
    let resolvePromise
    ;(callOpenAIAPI as jest.Mock).mockImplementation(() => {
      return new Promise((resolve) => {
        resolvePromise = resolve
      })
    })

    render(<Chat />)

    const input = screen.getByPlaceholderText("Ask about the context...")
    const sendButton = screen.getByText("Send")

    // Need to type something to enable the Send button
    await userEvent.type(input, "Test message")

    // Verify Send button is enabled before clicking
    expect(sendButton).not.toBeDisabled()

    // Click and wait for state update
    await userEvent.click(sendButton)

    // Now the loading state should be shown
    expect(screen.getByText("Generating response...")).toBeInTheDocument()

    // Resolve the promise to simulate API response completion
    await act(async () => {
      resolvePromise(mockResponse)
    })

    // Verify loading spinner is gone and response is shown
    expect(screen.queryByText("Generating response...")).not.toBeInTheDocument()
    expect(screen.getByText(mockResponse)).toBeInTheDocument()
  })
})
