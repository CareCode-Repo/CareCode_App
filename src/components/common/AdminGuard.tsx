'use client'
import { useRouter } from 'next/navigation'
import { ReactElement, ReactNode } from 'react'
import { getAccessToken } from '@/apis/auth'
import Button from '@/components/common/Button'
import EmptyState from '@/components/common/EmptyState'
import { useUserProfile } from '@/queries/user'

/**
 * 관리자 화면 가드.
 *
 * 실제 통제는 서버(`/api/admin/**` → ROLE_ADMIN)가 하고, 여기서는 권한 없는 사용자가
 * 빈 화면과 403 더미를 보지 않도록 안내만 한다.
 */
const AdminGuard = ({ children }: { children: ReactNode }): ReactElement => {
  const router = useRouter()
  const { data: user, isLoading } = useUserProfile()

  if (!getAccessToken()) {
    return (
      <EmptyState
        title="로그인이 필요해요"
        description="관리자 계정으로 로그인해주세요."
        actionLabel="로그인하기"
        onAction={() => router.replace('/')}
      />
    )
  }

  // 프로필을 받아야 역할을 알 수 있다. 그 전에 "권한 없음" 을 띄우면 오해를 준다.
  if (isLoading) {
    return <div className="h-40 animate-pulse bg-gray-100" aria-busy="true" />
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <p className="text-t2-semibold text-gray-800">접근 권한이 없어요</p>
        <p className="text-b1-regular text-gray-600">관리자만 볼 수 있는 화면입니다.</p>
        <Button
          color="gray"
          size="small"
          className="w-auto px-6"
          onClick={() => router.replace('/home')}
        >
          홈으로 가기
        </Button>
      </div>
    )
  }

  return <>{children}</>
}

export default AdminGuard
