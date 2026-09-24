'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ReactElement, useEffect, useRef, Suspense } from 'react'
import { setTokens } from '@/apis/auth'
import Loading from '@/components/common/loading'
import { usePostKakaoAuth } from '@/queries/auth'

const KakaoCallbackContent = (): ReactElement | null => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { mutate: postKakaoAuth, isPending } = usePostKakaoAuth()
  const processedRef = useRef<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')

    if (!code) {
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
        onSuccess: (data) => {
          if (data.success) {
            // 리프레시 토큰은 서버가 HttpOnly 쿠키로 심어 주므로 여기서 다루지 않는다.
            setTokens(data.accessToken, data.user.userId, data.expiresIn)

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
