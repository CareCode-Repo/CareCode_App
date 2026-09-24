import { ReactElement, useCallback } from 'react'
import PaperIcon from '@/assets/icons/paper_small.svg'
import Input from '@/components/common/input'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
  placeholder?: string
}

const ChatInput = ({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = '메시지를 입력하세요...',
}: ChatInputProps): ReactElement => {
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        onSend()
      }
    },
    [onSend],
  )

  const handleSendClick = useCallback(() => {
    if (!disabled && value.trim()) onSend()
  }, [disabled, value, onSend])

  return (
    <Input
      value={value}
      onChange={onChange}
      variant="rounded"
      placeholder={disabled ? '전송 중...' : placeholder}
      disabled={disabled}
      rightIcon={
        <PaperIcon
          className={`size-6 cursor-pointer transition-colors ${
            disabled || !value.trim()
              ? 'cursor-not-allowed fill-gray-400'
              : 'fill-gray-600 hover:fill-green-600'
          }`}
          onClick={handleSendClick}
        />
      }
      onKeyDown={handleKeyPress}
    />
  )
}

export default ChatInput
