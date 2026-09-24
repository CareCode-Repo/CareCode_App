import { ReactElement } from 'react'
import Button from './Button'
import Character from '@/assets/icons/characters/error.svg'

interface ErrorProps {
  content?: string
  retryText?: string
  onRetry?: () => void
}
const Error = ({
  content = '문제가 발생했습니다.\n잠시 후 다시 시도해주세요.',
  retryText = '다시 시도하기',
  onRetry,
}: ErrorProps): ReactElement => {
  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-gray-50">
      <div className="flex grow flex-col items-center justify-center gap-9">
        <Character className="size-40" />
        <p className="text-h3-bold text-center whitespace-pre-line text-black">{content}</p>
      </div>
      {onRetry && (
        <div className="p-6">
          <Button color="green" onClick={onRetry}>
            {retryText}
          </Button>
        </div>
      )}
    </div>
  )
}

export default Error
