import { motion } from 'motion/react'
import { memo, useEffect, useRef } from 'react'
import ChatMessage from '@/components/features/chat/chat-message'
import { ChatMessage as ChatMessageType } from '@/types/chat'

interface ChatContainerProps {
  messages: ChatMessageType[]
}

const ChatContainer = memo(({ messages }: ChatContainerProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 새 메시지가 추가되면 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  return (
    <div className="scrollbar-hide flex flex-1 flex-col gap-4 overflow-y-scroll py-4">
      {/* 메시지 리스트 */}
      {messages.map((message) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <ChatMessage message={message.message} isMyMessage={message.isMyMessage} />
        </motion.div>
      ))}
      {/* 스크롤 앵커 */}
      <div ref={messagesEndRef} />
    </div>
  )
})

ChatContainer.displayName = 'ChatContainer'

export default ChatContainer
