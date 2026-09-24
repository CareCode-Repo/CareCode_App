import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { ChatStore, ChatMessage } from '@/types/chat'

export const useChatStore = create<ChatStore>()(
  devtools(
    (set) => ({
      // State
      messages: [
        {
          id: '1',
          message: '안녕하세요! 육아 상담에 오신 것을 환영해요. 어떤 고민이 있으신지 말씀해주세요.',
          isMyMessage: false,
          timestamp: new Date().toISOString(),
        },
      ],
      currentSessionId: null,

      // Actions
      addMessage: (message: ChatMessage) =>
        set(
          (state) => ({
            messages: [...state.messages, message],
          }),
          false,
          'addMessage',
        ),

      updateMessage: (id: string, updates: Partial<ChatMessage>) =>
        set(
          (state) => ({
            messages: state.messages.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)),
          }),
          false,
          'updateMessage',
        ),

      setSessionId: (sessionId: string) =>
        set(() => ({ currentSessionId: sessionId }), false, 'setSessionId'),

      clearSession: () =>
        set(
          () => ({
            currentSessionId: null,
            messages: [
              {
                id: '1',
                message:
                  '안녕하세요! 육아 상담에 오신 것을 환영해요. 어떤 고민이 있으신지 말씀해주세요.',
                isMyMessage: false,
                timestamp: new Date().toISOString(),
              },
            ],
          }),
          false,
          'clearSession',
        ),
    }),
    {
      name: 'chat-store',
      // 프로덕션에서는 Redux DevTools 커넥터를 붙이지 않는다(액션 이력을 계속 들고 있다).
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
)
