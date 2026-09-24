import clsx from 'clsx'
import { ReactElement, ReactNode, memo } from 'react'

interface ChatBubbleProps {
  type?: 'user' | 'assistant'
  className?: string
  children: ReactNode
}

const ChatBubble = memo(({ type = 'user', className, children }: ChatBubbleProps): ReactElement => {
  return (
    <div
      className={clsx(
        'text-b2-regular max-w-xs rounded-t-lg p-3 break-words text-black',
        {
          'rounded-bl-lg bg-green-100': type === 'user',
          'rounded-br-lg border border-gray-300 bg-white': type === 'assistant',
        },
        className,
      )}
    >
      {children}
    </div>
  )
})

ChatBubble.displayName = 'ChatBubble'

export default ChatBubble
