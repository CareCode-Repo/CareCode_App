import clsx from 'clsx'
import { ReactElement } from 'react'
import CommentIcon from '@/assets/icons/chat_small.svg'
import LikeIcon from '@/assets/icons/like.svg'
import BookmarkIcon from '@/assets/icons/star_small.svg'

const ICON_MAP = {
  like: LikeIcon,
  comment: CommentIcon,
  bookmark: BookmarkIcon,
} as const

const TEXT_MAP = {
  like: '좋아요',
  comment: '댓글',
  bookmark: '북마크',
} as const

interface ActionButtonProps {
  type: keyof typeof ICON_MAP
  count?: number
  /** 내가 누른 상태인지 (좋아요·북마크) */
  active?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
}

const ActionButton = ({
  type,
  count,
  active = false,
  disabled = false,
  onClick,
  className,
}: ActionButtonProps): ReactElement => {
  const Icon = ICON_MAP[type]
  const text = TEXT_MAP[type]
  const isInteractive = !!onClick

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !isInteractive}
      aria-pressed={isInteractive ? active : undefined}
      className={clsx(
        'text-c1-regular flex items-center gap-1 transition-colors',
        active ? 'text-green-700' : 'text-gray-700',
        isInteractive && 'cursor-pointer disabled:opacity-50',
        className,
      )}
    >
      <Icon className={clsx('size-4.5', active ? 'fill-green-600' : 'fill-gray-600')} />
      <span>{count == null ? text : `${text} ${count}`}</span>
    </button>
  )
}

export default ActionButton
