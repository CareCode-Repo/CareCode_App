'use client'
import { ReactElement, useEffect } from 'react'
import ErrorView from '@/components/common/Error'
import { reportError } from '@/utils/errorReporting'

/**
 * 앱 전역 에러 바운더리.
 * 페이지마다 흩어져 있던 에러 표시 대신, 렌더 중 터진 예외를 여기서 한 번에 받는다.
 */
const GlobalError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}): ReactElement => {
  useEffect(() => {
    console.error('처리되지 않은 오류:', error)
    // digest 는 서버가 남긴 같은 오류의 식별자다. 서버 로그와 맞춰 보려면 필요하다.
    reportError(error, { boundary: 'page', ...(error.digest ? { digest: error.digest } : {}) })
  }, [error])

  return (
    <div className="relative h-dvh">
      <ErrorView onRetry={reset} />
    </div>
  )
}

export default GlobalError
