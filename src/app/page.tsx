'use client'
import { useRouter } from 'next/navigation'
import { JSX, useEffect } from 'react'
import { getAccessToken } from '@/apis/auth'
import { openKakaoLoginInBrowser } from '@/apis/kakaoAppAuth'
import Elipse from '@/assets/icons/characters/Ellipse.svg'
import GroundIcon from '@/assets/icons/characters/ground.svg'
import CharcacterIcon from '@/assets/icons/characters/login.svg'
import KakaoIcon from '@/assets/icons/logo/kakao.svg'
import LogoIcon from '@/assets/icons/logo/logo.svg'
import ErrorView from '@/components/common/Error'
import DevLoginButton from '@/components/features/login/DevLoginButton'
import { useGetKakaoAuthUrlMutation } from '@/queries/auth'
import { isNativeApp } from '@/utils/native'

export default function Home(): JSX.Element {
  const router = useRouter()
  const { mutate: getKakaoAuthUrl, isPending, error, reset } = useGetKakaoAuthUrlMutation()

  /**
   * 이미 로그인돼 있으면 홈으로 보낸다.
   *
   * `SessionBootstrap` 이 부팅 때 세션을 되살려 두지만, 되살린 뒤에 어디로 갈지는 아무도
   * 정하지 않았다. 그래서 로그인한 사용자가 이 화면을 그대로 보게 된다.
   *
   * 웹에서는 주소를 직접 쳐서 들어온 경우라 덜 눈에 띄었지만, **앱은 언제나 `/` 에서
   * 시작한다** — 로그인해 둔 사용자가 앱을 켤 때마다 로그인 화면을 보고 다시 로그인을
   * 눌러야 했다. 기기에서 돌려 보고서야 드러났다.
   *
   * 토큰이 메모리에 있는지로 판단한다. `SessionBootstrap` 이 복구를 끝낸 뒤에야 이 화면이
   * 그려지므로, 여기서 비어 있으면 정말로 로그인하지 않은 것이다.
   */
  useEffect(() => {
    if (getAccessToken()) router.replace('/home')
  }, [router])

  const handleKakaoLogin = () => {
    getKakaoAuthUrl(undefined, {
      onSuccess: (data) => {
        // 앱에서는 WebView 를 카카오로 보내면 안 된다 — 카카오가 인앱 브라우저 로그인을
        // 막고, 보내더라도 주소창·뒤로가기가 없어 빠져나올 수 없다. 자세한 흐름은
        // `apis/kakaoAppAuth.ts` 주석 참고.
        if (isNativeApp()) {
          openKakaoLoginInBrowser(data.loginUrl).catch((err) =>
            console.error('카카오 로그인 창을 열지 못했습니다:', err),
          )
          return
        }
        window.location.href = data.loginUrl
      },
      onError: (err) => {
        console.error('카카오 인증 URL을 가져오지 못했습니다:', err)
      },
    })
  }

  return (
    // 높이·너비를 특정 기기 크기로 못 박으면 그보다 작은 화면에서 가로 스크롤이 생긴다.
    <div className="relative flex h-full min-h-dvh w-full items-center justify-center overflow-hidden bg-green-200">
      <div className="relative flex flex-col items-center justify-center gap-19">
        <LogoIcon />
        <CharcacterIcon className="z-20 ml-7.5 size-60" />
        <Elipse className="absolute bottom-0 left-1/2 z-10 w-45 -translate-x-1/2" />
        <GroundIcon className="absolute -bottom-57 left-1/2 -translate-x-1/2" />
      </div>

      {/* 카카오 로그인 버튼 */}
      <div className="absolute bottom-0 w-full bg-white px-6 pt-6 pb-[max(2rem,var(--safe-bottom))]">
        <button
          type="button"
          onClick={handleKakaoLogin}
          disabled={isPending}
          className="text-t1-semibold bg-yellow relative flex w-full items-center justify-center rounded-lg py-3 focus-visible:ring-2 focus-visible:ring-gray-800 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
        >
          <KakaoIcon className="absolute left-6 size-5" aria-hidden />
          <span>{isPending ? '연결 중...' : '카카오로 로그인하기'}</span>
        </button>

        {/* 개발 환경에서만, 그리고 개발 계정 환경변수가 있을 때만 렌더된다. */}
        <DevLoginButton />
      </div>

      {error && <ErrorView content="잠시 후 다시 시도해주세요." onRetry={reset} />}
    </div>
  )
}
