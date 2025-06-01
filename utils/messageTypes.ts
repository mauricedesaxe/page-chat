// Message types for popup <-> background communication
export const MESSAGE_TYPES = {
  SEND_CHAT_REQUEST: "SEND_CHAT_REQUEST",
  CHAT_RESPONSE: "CHAT_RESPONSE",
  CHAT_ERROR: "CHAT_ERROR",
  CHAT_PROGRESS: "CHAT_PROGRESS",
  CANCEL_CHAT_REQUEST: "CANCEL_CHAT_REQUEST"
} as const

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES]

// Request/Response payloads
export interface ChatRequest {
  type: typeof MESSAGE_TYPES.SEND_CHAT_REQUEST
  payload: {
    requestId: string
    message: string
  }
}

export interface ChatResponse {
  type: typeof MESSAGE_TYPES.CHAT_RESPONSE
  payload: {
    requestId: string
    response: string
  }
}

export interface ChatError {
  type: typeof MESSAGE_TYPES.CHAT_ERROR
  payload: {
    requestId: string
    error: string
  }
}

export interface ChatProgress {
  type: typeof MESSAGE_TYPES.CHAT_PROGRESS
  payload: {
    requestId: string
    progress: string
  }
}

export interface CancelChatRequest {
  type: typeof MESSAGE_TYPES.CANCEL_CHAT_REQUEST
  payload: {
    requestId: string
  }
}

export type BackgroundMessage =
  | ChatRequest
  | ChatResponse
  | ChatError
  | ChatProgress
  | CancelChatRequest

// Storage state for chat requests
export interface ChatRequestState {
  requestId: string
  status: "pending" | "success" | "error" | "cancelled"
  message: string
  response?: string
  error?: string
  progress?: string
  timestamp: number
  lastUpdated: number
}
