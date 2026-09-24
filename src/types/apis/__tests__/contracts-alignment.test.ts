/**
 * 서버와 어긋나 화면이 통째로 막혔던 응답들. 서버가 실제로 주는 모양을 그대로 넣어 고정한다.
 */
import { describe, expect, it } from 'vitest'
import { getKakaoAuthUrlResponseSchema, kakaoRegistrationResponseSchema } from '@/types/apis/auth'
import { postCommentSchema } from '@/types/apis/community'
import { policySearchResponseSchema } from '@/types/apis/policy'

describe('getKakaoAuthUrlResponseSchema (GET /auth/kakao/login-url)', () => {
  it('서버가 주는 loginUrl 을 읽는다', () => {
    const parsed = getKakaoAuthUrlResponseSchema.parse({
      success: true,
      loginUrl:
        'https://kauth.kakao.com/oauth/authorize?client_id=x&redirect_uri=y&response_type=code',
      message: '카카오 로그인 URL이 생성되었습니다.',
    })

    expect(parsed.loginUrl).toContain('kauth.kakao.com')
  })
})

describe('kakaoRegistrationResponseSchema (UserDto)', () => {
  it('password 키가 없는 응답(서버 WRITE_ONLY)도 통과한다', () => {
    const parsed = kakaoRegistrationResponseSchema.parse({
      id: 7,
      userId: 'user_abc',
      email: 'kakao_1@kakao.com',
      name: '새사용자',
      role: 'PARENT',
      provider: 'KAKAO',
      isActive: true,
      emailVerified: false,
      registrationCompleted: true,
      createdAt: '2026-09-22T10:00:00',
      updatedAt: '2026-09-22T10:00:00',
    })

    expect(parsed.userId).toBe('user_abc')
  })
})

describe('postCommentSchema (CommunityCommentResponse)', () => {
  it('답글을 댓글 객체 트리로 읽는다', () => {
    const parsed = postCommentSchema.parse({
      commentId: 1,
      content: '부모 댓글',
      authorName: '가',
      authorId: '10',
      createdAt: '2026-09-22 10:00:00',
      likeCount: 0,
      isLiked: false,
      parentCommentId: null,
      replies: [
        {
          commentId: 2,
          content: '답글',
          authorName: '나',
          authorId: null,
          createdAt: '2026-09-22 10:01:00',
          likeCount: 0,
          isLiked: false,
          parentCommentId: 1,
          replies: [],
        },
      ],
    })

    expect(parsed.replies[0].content).toBe('답글')
    expect(parsed.replies[0].replies).toEqual([])
  })

  it('replies 가 없거나 null 이면 빈 배열로 둔다', () => {
    const parsed = postCommentSchema.parse({
      commentId: 1,
      content: '댓글',
      authorName: '가',
      createdAt: '2026-09-22 10:00:00',
      replies: null,
    })

    expect(parsed.replies).toEqual([])
  })
})

describe('policySearchResponseSchema (POST /policies/search)', () => {
  it('서버 PolicyListResponse 를 그대로 읽는다', () => {
    const parsed = policySearchResponseSchema.parse({
      policies: [
        {
          id: 3,
          title: '양육수당',
          description: null,
          category: null,
          location: '서울특별시',
          minAge: null,
          maxAge: null,
          supportAmount: 100000,
          applicationPeriod: null,
          contactInfo: null,
          websiteUrl: null,
        },
      ],
      totalElements: 1,
      totalCount: 1,
      currentPage: 0,
      pageSize: 100,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
      category: null,
      city: '서울',
      district: null,
    })

    expect(parsed.totalElements).toBe(1)
    expect(parsed.policies[0].id).toBe(3)
  })
})
