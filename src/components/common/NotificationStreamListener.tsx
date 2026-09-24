'use client'
import { useQueryClient } from '@tanstack/react-query'
import { ReactNode, useEffect } from 'react'
import { getAccessToken } from '@/apis/auth'
import { readNotificationStream } from '@/apis/notificationStream'
import { notificationQueries } from '@/queries/notification'

const MIN_RETRY_MS = 1_000
const MAX_RETRY_MS = 30_000

/**
 * 로그인해 있는 동안 알림 실시간 채널을 열어 둔다.
 *
 * 이벤트 내용을 캐시에 직접 끼워 넣지 않고 알림 목록·배지를 다시 불러온다. 목록이 진실의 원천이라,
 * 끊긴 사이에 온 알림도(connected 를 받으면 다시 불러오므로) 빠지지 않고 같은 알림을 두 번 받아도
 * 두 번 보이지 않는다.
 *
 * 끊기면 1초부터 두 배씩 최대 30초까지 기다렸다가 다시 연결한다. 로그인 전이면 연결하지 않고 기다린다.
 */
const NotificationStreamListener = ({ children }: { children: ReactNode }): ReactNode => {
  const queryClient = useQueryClient()

  useEffect(() => {
    const controller = new AbortController()
    let retryMs = MIN_RETRY_MS

    const refresh = () => queryClient.invalidateQueries({ queryKey: notificationQueries._def })

    const run = async () => {
      while (!controller.signal.aborted) {
        if (getAccessToken()) {
          try {
            await readNotificationStream((event) => {
              if (event.event === 'connected') retryMs = MIN_RETRY_MS
              if (event.event === 'connected' || event.event === 'notification') refresh()
            }, controller.signal)
          } catch {
            // 네트워크 오류·401(토큰 만료 직후) 모두 잠시 뒤 다시 시도한다. 토큰은 자동 갱신된다.
          }
        }
        if (controller.signal.aborted) return
        await new Promise((resolve) => setTimeout(resolve, retryMs))
        retryMs = Math.min(retryMs * 2, MAX_RETRY_MS)
      }
    }
    run()

    return () => controller.abort()
  }, [queryClient])

  return children
}

export default NotificationStreamListener
