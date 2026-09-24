'use client'
import { useEffect, useState } from 'react'
import { isNativeApp } from '@/utils/native'

/**
 * 지금 인터넷이 닿는지.
 *
 * 웹에서는 브라우저의 online/offline 이벤트로 충분하다. 앱에서는 그것만으로는 부족하다 —
 * WebView 의 `navigator.onLine` 은 기기가 비행기 모드에 들어가도 한참 true 로 남는 경우가
 * 있어서, 네이티브가 알려 주는 연결 상태를 함께 본다.
 *
 * 첫 렌더는 **언제나 online** 으로 시작한다. 서버에는 `navigator` 가 없어 판단할 수 없고,
 * 초기값을 저장소나 브라우저 API 로 정하면 서버와 클라이언트의 첫 렌더가 갈라져 hydration 이
 * 깨진다(이 저장소가 SessionBootstrap 에서 이미 겪은 문제다).
 */
export const useOnlineStatus = (): boolean => {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const update = (value: boolean): void => setIsOnline(value)

    // 웹 경로: 브라우저 이벤트.
    const handleOnline = (): void => update(true)
    const handleOffline = (): void => update(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    update(navigator.onLine)

    // 앱 경로: 네이티브 연결 상태를 덧붙인다.
    let removeNative: (() => void) | undefined

    if (isNativeApp()) {
      import('@capacitor/network')
        .then(async ({ Network }) => {
          const status = await Network.getStatus()
          update(status.connected)

          const handle = await Network.addListener('networkStatusChange', (next) =>
            update(next.connected),
          )
          removeNative = () => void handle.remove()
        })
        .catch(() => {
          // 플러그인을 못 불러와도 브라우저 이벤트로는 계속 동작한다.
        })
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      removeNative?.()
    }
  }, [])

  return isOnline
}
