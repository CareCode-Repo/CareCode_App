'use client'
import { ReactElement, useEffect } from 'react'
import ErrorView from '@/components/common/Error'

const AdminError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}): ReactElement => {
  useEffect(() => {
    console.error('관리자 화면 오류:', error)
  }, [error])

  return (
    <div className="relative h-full min-h-80">
      <ErrorView content="화면을 불러오지 못했어요." onRetry={reset} />
    </div>
  )
}

export default AdminError
