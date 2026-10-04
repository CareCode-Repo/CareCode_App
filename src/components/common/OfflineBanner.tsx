'use client'
import { ReactElement, ReactNode } from 'react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

/**
 * 인터넷이 끊겼을 때 이유를 알려 준다.
 *
 * 이게 없으면 지하철·엘리베이터에서 앱을 연 사용자는 화면마다 "불러오지 못했어요" 만 보고
 * **앱이 고장났다고 생각한다.** 원인을 한 줄로 알려 주는 것과 아닌 것의 차이가 크다.
 *
 * 연결이 돌아왔을 때 다시 불러오는 일은 **여기서 하지 않는다.** React Query 의
 * `onlineManager` 에 네이티브 연결 상태를 물려 두었으므로(`queries/nativeSignals.ts`),
 * 끊긴 동안에는 요청을 쉬고 돌아오면 `refetchOnReconnect` 가 알아서 다시 부른다.
 * 예전에는 여기서도 직접 무효화해서 복구할 때마다 같은 요청이 두 번 나갔다.
 */
const OfflineBanner = ({ children }: { children: ReactNode }): ReactElement => {
  const isOnline = useOnlineStatus()

  return (
    <>
      {!isOnline && (
        <div
          role="status"
          aria-live="polite"
          className="text-c1-semibold fixed inset-x-0 top-0 z-50 bg-gray-800 py-2 text-center text-white"
          style={{ paddingTop: 'max(0.5rem, var(--safe-top))' }}
        >
          인터넷에 연결되어 있지 않아요
        </div>
      )}
      {children}
    </>
  )
}

export default OfflineBanner
