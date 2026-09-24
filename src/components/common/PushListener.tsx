'use client'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect } from 'react'
import { onForegroundPush, onPushOpened } from '@/apis/push'
import { notificationQueries } from '@/queries/notification'

/**
 * 앱이 열려 있는 동안 도착한 푸시를 화면에 반영한다.
 *
 * 이때는 시스템 알림이 뜨지 않으므로, 알림이 왔는데도 안 읽음 배지가 그대로면
 * 사용자는 알림이 온 줄 모른다. 목록과 배지를 다시 읽어준다.
 *
 * 앱에서는 알림을 **탭해서** 열린 경우도 함께 받는다. 웹은 서비스 워커가 알림함을 열어
 * 주지만(firebase-messaging-sw.js), 앱에는 그 서비스 워커가 없다. 알림을 눌렀는데 홈이
 * 뜨면 무엇 때문에 열렸는지 알 수 없으므로 같은 이동을 여기서 해 준다.
 *
 * 푸시 설정이 없거나 권한을 받지 않았으면 아무 일도 하지 않는다.
 */
const PushListener = ({ children }: { children: ReactNode }): ReactNode => {
  const queryClient = useQueryClient()
  const router = useRouter()

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

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    let isCancelled = false

    onPushOpened(() => {
      queryClient.invalidateQueries({ queryKey: notificationQueries._def })
      // 개별 목적지는 알림함이 유형을 보고 정한다. 웹 서비스 워커와 같은 동작.
      router.push('/notification')
    }).then((cleanup) => {
      if (isCancelled) cleanup()
      else unsubscribe = cleanup
    })

    return () => {
      isCancelled = true
      unsubscribe?.()
    }
  }, [queryClient, router])

  return children
}

export default PushListener
