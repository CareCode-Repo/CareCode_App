import clsx from 'clsx'
import { ReactElement } from 'react'

interface NotificationCardProps {
  timeAgo: string
  title: string
  content: string
  isRead?: boolean
  onClick?: () => void
}

const NotificationCard = ({
  timeAgo,
  title,
  content,
  isRead = false,
  onClick,
}: NotificationCardProps): ReactElement => {
  return (
    <div
      className={clsx('flex flex-col gap-3 rounded-lg border bg-white px-3.5 py-3', {
        'border-green-600': !isRead,
        'border-gray-400': isRead,
      })}
      onClick={onClick}
    >
      {/* Header */}
      <div className="text-c1-regular flex items-center justify-between">
        <span className="text-gray-800">{timeAgo}</span>
        <span className={clsx(isRead ? 'text-black-500' : 'text-red')}>
          {isRead ? '읽음' : '읽지 않음'}
        </span>
      </div>
      {/* Title */}
      <h3 className="text-b1-semibold text-black">{title}</h3>
      {/* Content */}
      <div className="text-b2-regular text-black">
        {content.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    </div>
  )
}

export default NotificationCard
