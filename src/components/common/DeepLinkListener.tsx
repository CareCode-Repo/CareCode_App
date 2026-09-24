'use client'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect } from 'react'
import { closeKakaoLoginBrowser, readKakaoCodeFromDeepLink } from '@/apis/kakaoAppAuth'
import { isNativeApp } from '@/utils/native'

/**
 * 다른 앱·브라우저가 커스텀 스킴으로 이 앱을 열었을 때를 받는다.
 *
 * 지금은 카카오 로그인 복귀 하나뿐이다. 받은 인가 코드를 **기존 콜백 화면에 그대로 넘긴다** —
 * 토큰 교환·회원가입 분기·실패 처리는 이미 그 화면에 있고, 앱이라고 다를 게 없다.
 * 여기서 한 벌 더 만들면 한쪽만 고쳐지는 일이 생긴다.
 *
 * 웹에서는 아무 일도 하지 않는다(그런 스킴이 없다).
 */
const DeepLinkListener = ({ children }: { children: ReactNode }): ReactNode => {
  const router = useRouter()

  useEffect(() => {
    if (!isNativeApp()) return

    let remove: (() => void) | undefined

    import('@capacitor/app').then(async ({ App }) => {
      const handle = await App.addListener('appUrlOpen', async ({ url }) => {
        const code = readKakaoCodeFromDeepLink(url)
        // 우리가 다루는 주소가 아니면 그냥 둔다.
        if (code === null && !url.startsWith('com.carecode.app://oauth/kakao')) return

        // 로그인 창이 앱 위에 떠 있는 채로 남지 않게 한다.
        await closeKakaoLoginBrowser()

        if (!code) {
          // 사용자가 취소했거나 카카오가 코드를 주지 않았다. 로그인 화면으로 돌려보낸다.
          router.replace('/')
          return
        }

        router.replace(`/auth/kakao/callback?code=${encodeURIComponent(code)}`)
      })

      remove = () => void handle.remove()
    })

    return () => remove?.()
  }, [router])

  return children
}

export default DeepLinkListener
