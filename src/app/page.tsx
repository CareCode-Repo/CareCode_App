'use client'
import { JSX } from 'react'
import Elipse from '@/assets/icons/characters/Ellipse.svg'
import GroundIcon from '@/assets/icons/characters/ground.svg'
import CharcacterIcon from '@/assets/icons/characters/login.svg'
import KakaoIcon from '@/assets/icons/logo/kakao.svg'
import LogoIcon from '@/assets/icons/logo/logo.svg'
import ErrorView from '@/components/common/Error'
import DevLoginButton from '@/components/features/login/DevLoginButton'
import { useGetKakaoAuthUrlMutation } from '@/queries/auth'

export default function Home(): JSX.Element {
  const { mutate: getKakaoAuthUrl, isPending, error, reset } = useGetKakaoAuthUrlMutation()

  const handleKakaoLogin = () => {
    getKakaoAuthUrl(undefined, {
      onSuccess: (data) => {
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
      <div className="absolute bottom-0 w-full bg-white px-6 pt-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
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
