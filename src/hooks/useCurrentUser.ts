'use client'
import { getUserId } from '@/apis/auth'
import { useUserProfile } from '@/queries/user'

/**
 * "이거 내가 쓴 건가" 를 판별할 때 쓰는 식별자들.
 *
 * 서버는 사용자를 두 가지로 가리키고, 응답마다 어느 쪽을 담는지가 다르다.
 *
 * | 값        | 예시                      | 담기는 곳                                   |
 * | --------- | ------------------------- | ------------------------------------------- |
 * | `userId`  | `user_1787417490710_394`  | 토큰·세션, 시설 리뷰의 `userId`             |
 * | `dbId`    | `2`                       | 게시글·댓글의 `authorId`, 병원 리뷰의 `userId` |
 *
 * 한쪽만 보고 비교하면 **항상 거짓**이 되어 본인 글에도 수정·삭제가 뜨지 않는다
 * (실제로 게시글 상세가 그 상태였다). 비교하는 필드가 어느 쪽인지 확인하고 골라 쓴다.
 */
export const useCurrentUser = (): { userId: string | null; dbId: string | null } => {
  const { data: profile } = useUserProfile()

  return {
    userId: getUserId(),
    dbId: profile?.id != null ? String(profile.id) : null,
  }
}
