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
      {/* 빈 화면에서 이 문장이 그 화면의 제목 역할을 한다. 스크린리더도 그렇게 읽어야 한다. */}
      <h2 className="text-t2-semibold text-gray-800">{title}</h2>
      {description && (
        // gray-600 은 흰 바탕 4.61:1 이지만 회색 배경(gray-50) 위에서 4.41:1 로 미달했다.
        <p className="text-b1-regular whitespace-pre-line text-gray-700">{description}</p>
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
