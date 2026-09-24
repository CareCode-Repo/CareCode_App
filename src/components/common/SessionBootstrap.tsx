'use client'
import { ReactElement, ReactNode, useEffect, useState } from 'react'
import { clearTokens, getAccessToken, hasStoredSession } from '@/apis/auth'
import { runRefresh } from '@/apis/interceptor'

/**
 * 앱 부팅 시 세션 복구.
 *
 * 액세스 토큰은 메모리에만 두므로 새로고침하면 사라진다. 대신 HttpOnly 리프레시 쿠키가
 * 남아 있으므로, 로그인 이력이 있으면 갱신을 한 번 시도해 로그인 상태를 이어붙인다.
 * 복구가 끝나기 전에 하위 화면이 요청을 보내면 불필요한 401 이 나므로 그 동안은 렌더를 미룬다.
 *
 * 첫 렌더는 **서버와 클라이언트가 반드시 같아야** 한다. 판단 근거인 localStorage 는 서버에서
 * 읽을 수 없으므로, 초기값을 `useState(() => hasStoredSession() ...)` 로 두면 서버는 children,
 * 클라이언트는 대기 화면을 그려 매 페이지에서 hydration 이 깨진다. 그래서 양쪽 모두 대기
 * 화면으로 시작하고, 저장소를 읽는 판단은 effect 안에서만 한다.
 */
const SessionBootstrap = ({ children }: { children: ReactNode }): ReactElement => {
  const [isRestoring, setIsRestoring] = useState(true)

  useEffect(() => {
    // 복구할 세션이 없으면(로그아웃 상태이거나 토큰이 이미 메모리에 있으면) 그대로 통과시킨다.
    if (!hasStoredSession() || getAccessToken()) {
      setIsRestoring(false)
      return
    }

    let cancelled = false

    runRefresh()
      .catch(() => clearTokens())
      .finally(() => {
        if (!cancelled) setIsRestoring(false)
      })

    return () => {
      cancelled = true
    }
    // 최초 1회만 시도한다.
  }, [])

  if (isRestoring) {
    return <div className="h-dvh bg-gray-50" aria-busy="true" aria-label="세션 확인 중" />
  }

  return <>{children}</>
}

export default SessionBootstrap
