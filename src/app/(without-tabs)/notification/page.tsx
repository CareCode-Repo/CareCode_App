'use client'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactElement, useState } from 'react'
import AlertDialog from '@/components/common/AlertDialog'
import AuthGuard from '@/components/common/AuthGuard'
import Button from '@/components/common/Button'
import EmptyState from '@/components/common/EmptyState'
import ErrorView from '@/components/common/Error'
import Layout from '@/components/common/Layout'
import NotificationCard from '@/components/features/notification/NotificationCard'
import {
  useDeleteNotification,
  useMarkNotificationRead,
  useNotifications,
  useOpenNotification,
} from '@/queries/notification'
import { useMarkAllNotificationsRead } from '@/queries/notification'
import { Notification, NOTIFICATION_TARGET } from '@/types/apis/notification'
import { toDate } from '@/utils/date'

/** "10분 전" 형태. 날짜가 없거나 형식이 깨지면 표시를 비운다. */
const formatTimeAgo = (value?: string | null): string => {
  const date = toDate(value)
  if (!date) return ''
  return formatDistanceToNow(date, { addSuffix: true, locale: ko })
}

const NotificationPage = (): ReactElement => {
  const router = useRouter()
  const { data: notifications = [], isLoading, isError, refetch } = useNotifications()
  const { mutate: openNotification } = useOpenNotification()
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsRead()
  const { mutate: markRead } = useMarkNotificationRead()
  const { mutate: removeNotification } = useDeleteNotification()
  const [notificationToDelete, setNotificationToDelete] = useState<number | null>(null)

  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  const handleClick = (notification: Notification) => {
    // 서버가 클릭을 집계하고 읽음 처리한다. 이동은 앱 안에서 우리가 한다.
    openNotification(notification.id)

    const target = notification.notificationType
      ? NOTIFICATION_TARGET[notification.notificationType]
      : undefined
    if (target) router.push(target)
  }

  return (
    <AuthGuard>
      <Layout hasTopNav title="알림" hasBackButton contentClassName="px-4.5 py-6">
        {/* 알림이 없거나 불러오지 못했을 때도 설정으로는 갈 수 있어야 한다. */}
        <div className="flex justify-end pb-3">
          <Link href="/notification/settings" className="text-b2-semibold text-gray-600 underline">
            알림 설정
          </Link>
        </div>

        {isLoading ? (
          <ul className="flex flex-col gap-2.5">
            {[0, 1, 2].map((i) => (
              <li key={i} className="h-28 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </ul>
        ) : isError ? (
          <ErrorView content="알림을 불러오지 못했어요." onRetry={() => refetch()} />
        ) : !notifications.length ? (
          <EmptyState
            title="알림이 없어요"
            description={'예방접종 일정이나 지원금 마감이 다가오면\n여기로 알려드려요.'}
          />
        ) : (
          <>
            {unreadCount > 0 && (
              <div className="flex items-center justify-between pb-3">
                <span className="text-b2-regular text-gray-600">{`안 읽은 알림 ${unreadCount}개`}</span>
                <button
                  type="button"
                  onClick={() => markAllRead()}
                  disabled={isMarkingAll}
                  className="text-b2-semibold text-green-700 underline disabled:opacity-50"
                >
                  모두 읽음
                </button>
              </div>
            )}

            <ul className="flex flex-col gap-2.5">
              {notifications.map((notification) => (
                <li key={notification.id} className="flex flex-col gap-1">
                  <NotificationCard
                    timeAgo={formatTimeAgo(notification.createdAt)}
                    title={notification.title ?? '알림'}
                    content={notification.message ?? ''}
                    isRead={notification.isRead}
                    onClick={() => handleClick(notification)}
                  />
                  <div className="flex justify-end gap-3 pr-1">
                    {/* 열지 않고도 읽음 처리할 수 있어야 한다. 여는 순간 딥링크로 이동하기 때문이다. */}
                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={() => markRead(notification.id)}
                        className="text-c1-regular rounded text-gray-600 underline focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
                      >
                        읽음으로 표시
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setNotificationToDelete(notification.id)}
                      className="text-c1-regular rounded text-gray-500 underline focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <AlertDialog
              title="이 알림을 삭제할까요?"
              description="삭제한 알림은 되돌릴 수 없어요."
              isOpen={notificationToDelete !== null}
              onClose={() => setNotificationToDelete(null)}
              cancelButton={
                <Button color="gray" size="small" onClick={() => setNotificationToDelete(null)}>
                  취소
                </Button>
              }
              confirmButton={
                <Button
                  color="red"
                  size="small"
                  onClick={() => {
                    if (notificationToDelete !== null) removeNotification(notificationToDelete)
                    setNotificationToDelete(null)
                  }}
                >
                  삭제
                </Button>
              }
            />
          </>
        )}
      </Layout>
    </AuthGuard>
  )
}

export default NotificationPage
