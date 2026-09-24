export interface ChatMessage {
  id: string
  message: string
  isMyMessage: boolean
  timestamp: string
}

export interface ChatStore {
  messages: ChatMessage[]
  currentSessionId: string | null
  addMessage: (message: ChatMessage) => void
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  setSessionId: (sessionId: string) => void
  clearSession: () => void
}

export type SendMessageOptions = {
  message: string
}

export interface UseChatMessagesReturn {
  messages: ChatMessage[]
  recommendations: string[]
  sendMessage: (options: SendMessageOptions) => Promise<void>
  isSending: boolean
}
