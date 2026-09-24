'use client'
import { useRouter } from 'next/navigation'
import { ReactElement, ReactNode, useEffect, useState } from 'react'
import { getAccessToken } from '@/apis/auth'

/**
 * 로그인이 필요한 화면을 감싸는 가드.
 *
 * 액세스 토큰이 메모리에만 있어 서버 미들웨어에서는 판별할 수 없으므로 클라이언트에서 확인한다.
 * 새로고침 직후의 세션 복구는 SessionBootstrap 이 먼저 끝내 주므로 여기서는 결과만 본다.
 */
const AuthGuard = ({
  children,
  fallback = null,
}: {
  children: ReactNode
  fallback?: ReactNode
}): ReactElement | null => {
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'authed'>('checking')

  useEffect(() => {
    if (getAccessToken()) {
      setStatus('authed')
      return
    }
    router.replace('/')
  }, [router])

  if (status === 'checking') return <>{fallback}</>

  return <>{children}</>
}

export default AuthGuard
