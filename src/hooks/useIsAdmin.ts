'use client'
import { useUserProfile } from '@/queries/user'

/**
 * 관리자 여부.
 *
 * 화면 노출을 정리하기 위한 판단일 뿐 접근 통제는 서버가 한다
 * (`/api/admin/**` 은 ROLE_ADMIN 을 요구한다). 프런트에서 막았다고 안전해지지 않는다.
 */
export const useIsAdmin = (): boolean => {
  const { data: user } = useUserProfile()
  return user?.role === 'ADMIN'
}
