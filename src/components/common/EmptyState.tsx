import { ReactElement, ReactNode } from 'react'
import Button from './Button'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: ReactNode
}

/** 목록이 비었을 때 쓰는 공통 표시. 다음 행동을 한 개만 제시한다. */
const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps): ReactElement => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      {icon}
      <p className="text-t2-semibold text-gray-800">{title}</p>
      {description && (
        <p className="text-b1-regular whitespace-pre-line text-gray-600">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button color="green" size="small" className="mt-3 w-auto px-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
