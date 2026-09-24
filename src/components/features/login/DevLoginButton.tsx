'use client'
import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'
import { getErrorMessage } from '@/apis/errors'
import { usePostLogin } from '@/queries/auth'

/**
 * 개발용 빠른 로그인.
 *
 * 카카오 로그인은 실제 앱 키와 등록된 리다이렉트 URI 가 있어야 하므로 로컬에서는 쓸 수 없다.
 * 그 때문에 로그인 뒤 화면(아이 관리·건강 기록·마이페이지)을 전혀 확인할 수 없었다.
 *
 * **프로덕션 번들에 들어가면 안 된다.** 아래 두 겹으로 막는다.
 * 1. `process.env.NODE_ENV` 는 빌드 시 상수로 치환되므로 이 분기 전체가 죽은 코드가 되어 제거된다.
 * 2. 계정 정보는 환경변수로만 주입한다. 값이 없으면 버튼 자체가 나오지 않는다.
 */
const DEV_EMAIL = process.env.NEXT_PUBLIC_DEV_LOGIN_EMAIL
const DEV_PASSWORD = process.env.NEXT_PUBLIC_DEV_LOGIN_PASSWORD

const DevLoginButton = (): ReactElement | null => {
  const router = useRouter()
  const { mutate: login, isPending, isError, error } = usePostLogin()

  if (process.env.NODE_ENV !== 'development') return null
  if (!DEV_EMAIL || !DEV_PASSWORD) return null

  const handleClick = () => {
    login(
      { email: DEV_EMAIL, password: DEV_PASSWORD },
      {
        onSuccess: (data) => {
          if (!data.success) return
          router.replace('/home')
        },
      },
    )
  }

  return (
    <div className="mt-3 flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="text-b1-semibold w-full rounded-lg border border-dashed border-gray-600 bg-white/80 py-2.5 text-gray-800 focus-visible:ring-2 focus-visible:ring-gray-800 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
      >
        {isPending ? '로그인 중...' : `[DEV] ${DEV_EMAIL} 로 로그인`}
      </button>

      {isError && (
        <p className="text-red text-b2-regular text-center" role="alert">
          {getErrorMessage(
            error,
            '개발 계정으로 로그인하지 못했어요. 백엔드가 떠 있는지 확인해주세요.',
          )}
        </p>
      )}
    </div>
  )
}

export default DevLoginButton
