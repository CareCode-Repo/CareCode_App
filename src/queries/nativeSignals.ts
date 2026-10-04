import { focusManager, onlineManager } from '@tanstack/react-query'
import { isNativeApp } from '@/utils/native'

/**
 * 앱의 네이티브 신호를 React Query 에 연결한다.
 *
 * React Query 는 기본적으로 브라우저만 본다 — 화면 전환은 `visibilitychange`, 연결 상태는
 * `navigator.onLine`. **WebView 에서는 둘 다 믿을 수 없다.**
 *
 * - 앱을 백그라운드로 보냈다 돌아와도 `visibilitychange` 가 오지 않거나 늦게 온다. 그러면
 *   `refetchOnWindowFocus` 가 켜져 있어도 동작하지 않아, 두 시간 뒤에 앱을 열면 화면이 두
 *   시간 전 데이터 그대로다. 알림함의 안 읽음 배지가 특히 티가 난다.
 * - `navigator.onLine` 은 기기가 비행기 모드에 들어가도 한참 true 로 남는다. 그 사이
 *   React Query 는 끊긴 줄 모르고 요청마다 3번씩 재시도한다 — 배터리만 쓰고 전부 실패한다.
 *   네이티브 신호를 주면 끊긴 동안 아예 쉬고, 돌아오면 알아서 다시 불러온다
 *   (`refetchOnReconnect`).
 *
 * 앱이 살아 있는 동안 한 번만 건다. React Query 가 구독 해제를 맡으므로 여기서 돌려줄
 * 정리 함수는 없다 — 웹에서는 기본 동작이 맞으므로 아무것도 하지 않는다.
 */
export const connectNativeQuerySignals = (): void => {
  if (!isNativeApp()) return

  // 앱이 앞으로 나오면 "창에 포커스가 돌아왔다" 로 알린다.
  focusManager.setEventListener((handleFocus) => {
    let remove: (() => void) | undefined

    import('@capacitor/app')
      .then(async ({ App }) => {
        const handle = await App.addListener('appStateChange', ({ isActive }) =>
          handleFocus(isActive),
        )
        remove = () => void handle.remove()
      })
      .catch(() => undefined)

    return () => remove?.()
  })

  // 연결 상태는 네이티브가 아는 값을 쓴다.
  onlineManager.setEventListener((setOnline) => {
    let remove: (() => void) | undefined

    import('@capacitor/network')
      .then(async ({ Network }) => {
        // 지금 상태부터 맞춘다. 첫 신호를 기다리면 그때까지 잘못 알고 있다.
        const status = await Network.getStatus()
        setOnline(status.connected)

        const handle = await Network.addListener('networkStatusChange', ({ connected }) =>
          setOnline(connected),
        )
        remove = () => void handle.remove()
      })
      .catch(() => {
        // 플러그인을 못 불러왔다고 끊긴 것으로 보면 안 된다 — 요청을 전부 막는 쪽이 더 나쁘다.
        setOnline(true)
      })

    return () => remove?.()
  })
}
