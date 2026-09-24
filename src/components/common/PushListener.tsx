'use client'
import { useQueryClient } from '@tanstack/react-query'
import { ReactNode, useEffect } from 'react'
import { onForegroundPush } from '@/apis/push'
import { notificationQueries } from '@/queries/notification'

/**
 * 앱이 열려 있는 동안 도착한 푸시를 화면에 반영한다.
 *
 * 이때는 시스템 알림이 뜨지 않으므로, 알림이 왔는데도 안 읽음 배지가 그대로면
 * 사용자는 알림이 온 줄 모른다. 목록과 배지를 다시 읽어준다.
 *
 * 푸시 설정이 없거나 권한을 받지 않았으면 아무 일도 하지 않는다.
 */
const PushListener = ({ children }: { children: ReactNode }): ReactNode => {
  const queryClient = useQueryClient()

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    let isCancelled = false

    onForegroundPush(() => {
      queryClient.invalidateQueries({ queryKey: notificationQueries._def })
    }).then((cleanup) => {
      // 구독이 완료되기 전에 언마운트됐다면 바로 해제한다.
      if (isCancelled) cleanup()
      else unsubscribe = cleanup
    })

    return () => {
      isCancelled = true
      unsubscribe?.()
    }
  }, [queryClient])

  return children
}

export default PushListener
