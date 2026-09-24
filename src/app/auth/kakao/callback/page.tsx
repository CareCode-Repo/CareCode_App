'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ReactElement, useEffect, useRef, Suspense } from 'react'
import { setTokens } from '@/apis/auth'
import { KAKAO_APP_STATE, buildKakaoAppRedirect } from '@/apis/kakaoAppAuth'
import { saveRefreshToken } from '@/apis/session'
import Loading from '@/components/common/loading'
import { usePostKakaoAuth } from '@/queries/auth'
import { isNativeApp } from '@/utils/native'

const KakaoCallbackContent = (): ReactElement | null => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { mutate: postKakaoAuth, isPending } = usePostKakaoAuth()
  const processedRef = useRef<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')

    /**
     * 앱에서 시작한 로그인이면 지금 이 화면은 **시스템 브라우저 안**이다.
     * 여기서 토큰을 받아 봐야 앱은 알 수 없다. 인가 코드만 커스텀 스킴으로 넘기고 끝낸다.
     * (앱 안에서는 이 분기를 타지 않는다 — 딥링크 리스너가 state 없이 이 화면을 연다)
     */
    if (!isNativeApp() && searchParams.get('state') === KAKAO_APP_STATE) {
      window.location.replace(buildKakaoAppRedirect(code ? { code } : { error: 'no_code' }))
      return
    }

    if (!code) {
      /**
       * 코드를 이미 받아 교환을 시작했다면, 이건 "코드가 없는 진입" 이 아니라 아래에서
       * 주소의 코드를 지운 뒤 이 effect 가 다시 돈 것이다. 그대로 두면 교환이 끝나기도 전에
       * 로그인 화면으로 돌려보내 로그인 중에 화면이 한 번 튄다.
       * (기기에서 딥링크로 들어올 때 로그로 드러났다)
       */
      if (processedRef.current) return

      console.error('카카오 인가 코드가 없습니다.')
      router.replace('/')
      return
    }

    // 이미 처리된 코드인지 확인하여 중복 API 호출 방지
    if (processedRef.current === code) {
      return
    }

    // 코드 처리 시작 표시
    processedRef.current = code

    // 인가 코드는 크리덴셜이다. 주소창·히스토리·리퍼러에 남기지 않는다.
    // (교환은 이미 시작됐으므로 지워도 흐름에 영향이 없다)
    window.history.replaceState({}, '', window.location.pathname)

    postKakaoAuth(
      { code },
      {
        onSuccess: async (data) => {
          if (data.success) {
            setTokens(data.accessToken, data.user.userId, data.expiresIn)
            // 웹에서는 서버가 HttpOnly 쿠키로 심어 주므로 no-op 이고, 앱에서는 그 쿠키가 막혀
            // 본문의 값을 Keychain/Keystore 에 보관한다. 화면을 옮기기 전에 끝내 둔다.
            await saveRefreshToken(data.refreshToken)

            // 콜백은 히스토리에 남기지 않는다. 뒤로가기로 돌아오면 소진된 코드로 재시도하게 된다.
            // 회원가입이 완료되지 않은 경우 회원가입 페이지로
            router.replace(data.isNewUser ? '/signup' : '/home')
          } else {
            console.error('카카오 로그인 실패:', data.message)
            processedRef.current = null // 실패 시 재시도 가능하도록 초기화
            router.replace('/')
          }
        },
        onError: (error) => {
          console.error('카카오 로그인 오류:', error)

          // 인가 코드는 일회용이라 같은 코드로 재시도해봐야 계속 실패한다.
          // processedRef 를 되돌리지 않고 로그인 화면에서 새 코드를 받게 한다.
          router.replace('/')
        },
      },
    )
  }, [searchParams, postKakaoAuth, router])

  if (isPending) {
    return <Loading content="카카오 로그인 중..." />
  }

  return null
}

const KakaoCallbackPage = (): ReactElement => {
  return (
    <Suspense fallback={<Loading content="카카오 로그인 중..." />}>
      <KakaoCallbackContent />
    </Suspense>
  )
}

export default KakaoCallbackPage
