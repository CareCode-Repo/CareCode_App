'use client'
import { useQueryClient } from '@tanstack/react-query'
import { ReactElement, ReactNode, useEffect, useRef } from 'react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

/**
 * 인터넷이 끊겼을 때 알려 주고, 돌아오면 화면을 다시 채운다.
 *
 * 이게 없으면 지하철·엘리베이터에서 앱을 연 사용자는 화면마다 "불러오지 못했어요" 만 보고
 * **앱이 고장났다고 생각한다.** 원인을 한 줄로 알려 주는 것과 아닌 것의 차이가 크다.
 *
 * 연결이 돌아왔을 때 새로고침을 사용자에게 시키지 않는다. 쿼리를 한 번 무효화하면
 * 화면에 떠 있는 것들이 알아서 다시 불러온다 — 앱에는 새로고침 버튼이 없다는 점이 중요하다.
 */
const OfflineBanner = ({ children }: { children: ReactNode }): ReactElement => {
  const isOnline = useOnlineStatus()
  const queryClient = useQueryClient()
  const wasOffline = useRef(false)

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true
      return
    }

    // 처음부터 온라인이었다면 다시 불러올 이유가 없다.
    if (!wasOffline.current) return

    wasOffline.current = false
    queryClient.invalidateQueries()
  }, [isOnline, queryClient])

  return (
    <>
      {!isOnline && (
        <div
          role="status"
          aria-live="polite"
          className="text-c1-semibold fixed inset-x-0 top-0 z-50 bg-gray-800 py-2 text-center text-white"
          style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
        >
          인터넷에 연결되어 있지 않아요
        </div>
      )}
      {children}
    </>
  )
}

export default OfflineBanner
