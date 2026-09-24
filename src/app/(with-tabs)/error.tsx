'use client'
import { ReactElement, useEffect } from 'react'
import ErrorView from '@/components/common/Error'

/**
 * 이 그룹 안에서 렌더 중 터진 예외를 여기서 받는다.
 *
 * 루트 error.tsx 만 있으면 화면 하나가 깨져도 레이아웃까지 통째로 날아가
 * 사용자가 다른 탭으로 옮겨갈 수단조차 사라진다. 그룹 경계에서 잡아
 * 탭 바와 상단바는 살려 둔다.
 */
const GroupError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}): ReactElement => {
  useEffect(() => {
    console.error('화면 렌더 중 오류:', error)
  }, [error])

  return (
    <div className="relative h-full">
      <ErrorView onRetry={reset} />
    </div>
  )
}

export default GroupError
