require("@testing-library/jest-dom")

// Mock Chrome API
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      onChanged: {
        addListener: jest.fn(),
        removeListener: jest.fn()
      }
    }
  },
  contextMenus: {
    create: jest.fn(),
    removeAll: jest.fn()
  },
  runtime: {
    lastError: null
  }
}
