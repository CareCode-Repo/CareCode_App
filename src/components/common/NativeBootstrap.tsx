'use client'
import { usePathname, useRouter } from 'next/navigation'
import { ReactElement, useEffect } from 'react'
import { isNativeApp, isAndroid, nativePlatform } from '@/utils/native'

/** 탭바가 있는 최상위 화면들. 여기서 뒤로 가기를 누르면 앱을 내린다. */
const ROOT_PATHS = ['/', '/home', '/community', '/chat', '/search', '/mypage']

/**
 * 네이티브 셸과 웹 화면을 이어 주는 초기화.
 *
 * 웹에서는 아무 일도 하지 않는다(플러그인이 없으므로 부르면 터진다). 플러그인은 전부
 * **지연 import** 한다 — 정적으로 불러오면 브라우저 번들에 네이티브 전용 코드가 실린다.
 */
const NativeBootstrap = ({ children }: { children: React.ReactNode }): ReactElement => {
  const router = useRouter()
  const pathname = usePathname()

  // 스플래시 내리기 · 상태바 · 키보드. 앱이 뜬 뒤 한 번만.
  useEffect(() => {
    if (!isNativeApp()) return

    // CSS 가 네이티브 여부로 분기할 수 있게 표식을 남긴다(.app-viewport 등).
    document.documentElement.dataset.native = nativePlatform()

    const setup = async (): Promise<void> => {
      const [{ SplashScreen }, { StatusBar, Style }] = await Promise.all([
        import('@capacitor/splash-screen'),
        import('@capacitor/status-bar'),
      ])

      // 상태바 글자를 어둡게. 앱 배경이 흰색·연한 노랑이라 밝은 글자는 읽히지 않는다.
      await StatusBar.setStyle({ style: Style.Light }).catch(() => undefined)

      // 웹 자산이 실제로 그려진 다음에 내린다. 시간으로 재면 느린 기기에서 흰 화면이 보인다.
      await SplashScreen.hide()
    }

    setup().catch(() => {
      // 초기화가 실패해도 스플래시에 갇히는 것만은 막는다.
      import('@capacitor/splash-screen').then(({ SplashScreen }) => SplashScreen.hide())
    })
  }, [])

  // 안드로이드 하드웨어 뒤로 가기. 웹의 history 와 연결하지 않으면 앱이 그냥 종료된다.
  useEffect(() => {
    if (!isNativeApp() || !isAndroid()) return

    let remove: (() => void) | undefined

    import('@capacitor/app').then(async ({ App }) => {
      const handle = await App.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack && !ROOT_PATHS.includes(pathname)) {
          router.back()
          return
        }
        // 최상위 화면에서의 뒤로 가기는 종료가 아니라 홈으로 내리기다.
        // 종료시키면 다시 열 때 앱이 처음부터 뜬다.
        App.minimizeApp()
      })
      remove = () => handle.remove()
    })

    return () => remove?.()
  }, [pathname, router])

  return <>{children}</>
}

export default NativeBootstrap
